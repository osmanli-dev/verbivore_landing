import ExcelJS from 'exceljs';
import multer from 'multer';
import { CLIENT_SCRIPT } from './client-script.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

const MEDAL_VALUES = ['Gold', 'Silver', 'Bronze', 'Honorable Mention', 'Participation'];
const RESULTS_TEMPLATE_HEADERS = [
	'editionSlug', 'countryName', 'countryFlag', 'teamLeader', 'organization',
	'studentName', 'studentClass', 'category', 'score', 'medal',
];
const RESULTS_TEMPLATE_EXAMPLE = [
	'2026-uk', 'Azerbaijan', '🇦🇿', 'Dr. Nigar Aliyeva', 'Global Olympiad Center',
	'Ayla Mammadova', '7B', 'Junior B', '94/100', 'Gold',
];

/** Directus's internal schema snapshot (getSchema()) doesn't carry an
 *  is_unique flag — unlike the admin /fields/:collection/:field REST shape,
 *  it's a flattened SchemaOverview meant for query building. Read the real
 *  unique single-column constraints straight from SQLite's own catalog. */
async function getUniqueSingleColumnFields(database, collection) {
	const indexes = await database.raw('PRAGMA index_list(??)', [collection]);
	const unique = new Set();
	for (const idx of indexes) {
		if (!idx.unique) continue;
		const cols = await database.raw('PRAGMA index_info(??)', [idx.name]);
		if (cols.length === 1) unique.add(cols[0].name);
	}
	return unique;
}

function requireAdmin(req, res) {
	if (!req.accountability?.admin) {
		res.status(403).json({ errors: [{ message: 'Only admin accounts may bulk-import data.' }] });
		return false;
	}
	return true;
}

/** Every non-alias, non-primary-key field on a collection, plus which ones
 *  are m2o relations (so we can resolve human-readable text back to an id). */
function describeFields(schema, relations, collection) {
	const pkField = schema.collections[collection]?.primary;
	const relByField = new Map(
		relations.filter((r) => r.collection === collection && r.related_collection).map((r) => [r.field, r.related_collection])
	);
	const fields = Object.values(schema.collections[collection].fields)
		.filter((f) => !f.alias && f.field !== pkField)
		.map((f) => ({ field: f.field, note: f.note, relatedCollection: relByField.get(f.field) || null }));
	return fields;
}

/** Pick the best human-readable field to look items up by / display for a
 *  related collection — prefers a clean stable identifier over the display
 *  template's field, falling back to common name-ish fields. */
async function pickDisplayField(collectionsService, schema, relatedCollection) {
	const fields = schema.collections[relatedCollection]?.fields || {};
	for (const c of ['slug', 'code', 'name']) {
		if (fields[c]) return c;
	}
	try {
		const info = await collectionsService.readOne(relatedCollection);
		const tpl = info?.meta?.display_template;
		const m = tpl && /^\{\{\s*([a-zA-Z0-9_]+)\s*\}\}$/.exec(tpl.trim());
		if (m && fields[m[1]]) return m[1];
	} catch { /* fall through to defaults below */ }
	for (const c of ['title', 'shortTitle']) {
		if (fields[c]) return c;
	}
	return schema.collections[relatedCollection].primary;
}

async function buildLookup(itemsService, displayField) {
	const rows = await itemsService.readByQuery({ fields: ['*'], limit: -1 });
	const pk = rows[0] ? Object.keys(rows[0]).find((k) => k === 'id') || 'id' : 'id';
	const map = new Map();
	for (const row of rows) {
		const label = row[displayField];
		if (label != null) map.set(String(label).trim().toLowerCase(), row[pk]);
	}
	return map;
}

function cellText(cell) {
	if (cell == null) return '';
	if (typeof cell === 'object' && cell.text != null) return String(cell.text).trim(); // rich text
	if (typeof cell === 'object' && cell.result != null) return String(cell.result).trim(); // formula
	return String(cell).trim();
}

async function readSheet(buffer) {
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.load(buffer);
	const sheet = workbook.worksheets[0];
	if (!sheet) return { headers: [], rows: [] };
	const headerRow = sheet.getRow(1);
	const headers = [];
	headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
		headers[colNumber] = cellText(cell.value);
	});
	const rows = [];
	sheet.eachRow((row, rowNumber) => {
		if (rowNumber === 1) return;
		const obj = {};
		let hasValue = false;
		headers.forEach((h, colNumber) => {
			if (!h) return;
			const v = cellText(row.getCell(colNumber).value);
			obj[h] = v;
			if (v !== '') hasValue = true;
		});
		if (hasValue) rows.push({ rowNumber, obj });
	});
	return { headers, rows };
}

function makeTemplateWorkbook(sheetName, headers, exampleRow, noteRows = []) {
	const workbook = new ExcelJS.Workbook();
	const sheet = workbook.addWorksheet(sheetName.slice(0, 31));
	sheet.columns = headers.map((h) => ({ header: h, key: h, width: Math.max(18, h.length + 4) }));
	sheet.getRow(1).font = { bold: true };
	if (exampleRow) sheet.addRow(exampleRow);
	for (const note of noteRows) sheet.addRow(note);
	return workbook;
}

export default (router, { services, getSchema, database }) => {
	const { ItemsService, CollectionsService } = services;

	// Same same-origin-script trick as excel-export (admin CSP blocks inline scripts).
	router.get('/_client.js', (_req, res) => {
		res.type('application/javascript').send(CLIENT_SCRIPT);
	});

	/* ── Results template: GET /bulk-import/template/results ─────────── */
	/* Registered before the generic /template/:collection route below —
	   Express matches routes in registration order and :collection would
	   otherwise swallow the literal "results" segment. Same reasoning for
	   POST /results vs POST /:collection further down. */
	router.get('/template/results', async (_req, res, next) => {
		try {
			const workbook = makeTemplateWorkbook('results-template', RESULTS_TEMPLATE_HEADERS, RESULTS_TEMPLATE_EXAMPLE, [
				[], ['One row per student. Rows sharing the same editionSlug + countryName',
					'are grouped into one delegation. Re-uploading replaces that country\'s',
					'delegation entirely (safe to re-run after fixing a mistake).'],
			]);
			res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
			res.setHeader('Content-Disposition', 'attachment; filename="results-import-template.xlsx"');
			await workbook.xlsx.write(res);
			res.end();
		} catch (error) {
			next(error);
		}
	});

	/* ── Template download: GET /bulk-import/template/:collection ────── */
	router.get('/template/:collection', async (req, res, next) => {
		const { collection } = req.params;
		try {
			const schema = await getSchema();
			if (!schema.collections[collection]) {
				return res.status(404).json({ errors: [{ message: `Unknown collection "${collection}".` }] });
			}
			const collectionsService = new CollectionsService({ schema, accountability: req.accountability });
			const fields = describeFields(schema, schema.relations, collection);
			const headers = fields.map((f) => f.field);
			const exampleCells = await Promise.all(
				fields.map(async (f) => (f.relatedCollection
					? `(${await pickDisplayField(collectionsService, schema, f.relatedCollection)} of ${f.relatedCollection})`
					: ''))
			);
			const workbook = makeTemplateWorkbook(`${collection}-template`, headers, exampleCells);
			res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
			res.setHeader('Content-Disposition', `attachment; filename="${collection}-import-template.xlsx"`);
			await workbook.xlsx.write(res);
			res.end();
		} catch (error) {
			next(error);
		}
	});

	/* ── Results import (nested into editions.countryDelegations): ───── */
	router.post('/results', upload.single('file'), async (req, res, next) => {
		if (!requireAdmin(req, res)) return;
		if (!req.file) {
			return res.status(400).json({ errors: [{ message: 'No file uploaded (expected form field "file").' }] });
		}
		try {
			const schema = await getSchema();
			const editionsService = new ItemsService('editions', { schema, accountability: req.accountability });
			const { rows } = await readSheet(req.file.buffer);
			if (rows.length === 0) {
				return res.status(400).json({ errors: [{ message: 'The file has no data rows.' }] });
			}

			// Group student rows by editionSlug -> countryName.
			const byEdition = new Map();
			const skipped = [];
			for (const { rowNumber, obj } of rows) {
				const editionSlug = (obj.editionSlug || '').trim();
				const countryName = (obj.countryName || '').trim();
				const studentName = (obj.studentName || '').trim();
				if (!editionSlug || !countryName || !studentName) {
					skipped.push({ row: rowNumber, reason: 'editionSlug, countryName and studentName are all required.' });
					continue;
				}
				if (obj.medal && !MEDAL_VALUES.includes(obj.medal.trim())) {
					skipped.push({ row: rowNumber, reason: `medal must be one of: ${MEDAL_VALUES.join(', ')} (got "${obj.medal}")` });
					continue;
				}
				if (!byEdition.has(editionSlug)) byEdition.set(editionSlug, new Map());
				const byCountry = byEdition.get(editionSlug);
				if (!byCountry.has(countryName)) {
					byCountry.set(countryName, {
						countryName,
						countryFlag: (obj.countryFlag || '').trim(),
						teamLeader: (obj.teamLeader || '').trim(),
						organization: (obj.organization || '').trim(),
						students: [],
					});
				}
				byCountry.get(countryName).students.push({
					name: studentName,
					class: (obj.studentClass || '').trim(),
					category: (obj.category || '').trim(),
					score: (obj.score || '').trim(),
					medal: (obj.medal || '').trim(),
				});
			}

			const editionResults = [];
			for (const [editionSlug, byCountry] of byEdition) {
				const existing = await editionsService.readByQuery({
					filter: { slug: { _eq: editionSlug } }, fields: ['id', 'countryDelegations', 'medalTable'], limit: 1,
				});
				if (!existing[0]) {
					for (const country of byCountry.values()) {
						skipped.push({ row: null, reason: `Edition "${editionSlug}" (country ${country.countryName}) not found — skipped.` });
					}
					continue;
				}
				const edition = existing[0];
				const delegations = Array.isArray(edition.countryDelegations) ? [...edition.countryDelegations] : [];
				const medalTable = Array.isArray(edition.medalTable) ? [...edition.medalTable] : [];
				let countriesTouched = 0;

				for (const country of byCountry.values()) {
					const idx = delegations.findIndex((d) => (d.countryName || '').trim().toLowerCase() === country.countryName.toLowerCase());
					if (idx >= 0) delegations[idx] = { ...delegations[idx], ...country };
					else delegations.push(country);
					countriesTouched++;

					const counts = { gold: 0, silver: 0, bronze: 0, honorable: 0, participation: 0 };
					for (const s of country.students) {
						if (s.medal === 'Gold') counts.gold++;
						else if (s.medal === 'Silver') counts.silver++;
						else if (s.medal === 'Bronze') counts.bronze++;
						else if (s.medal === 'Honorable Mention') counts.honorable++;
						else if (s.medal === 'Participation') counts.participation++;
					}
					const mIdx = medalTable.findIndex((m) => (m.countryName || '').trim().toLowerCase() === country.countryName.toLowerCase());
					const medalRow = { countryName: country.countryName, countryFlag: country.countryFlag, hasDetails: true, ...counts };
					if (mIdx >= 0) medalTable[mIdx] = { ...medalTable[mIdx], ...medalRow };
					else medalTable.push(medalRow);
				}

				await editionsService.updateOne(edition.id, { countryDelegations: delegations, medalTable });
				editionResults.push({ editionSlug, countriesUpdated: countriesTouched });
			}

			res.json({ editions: editionResults, skipped, totalRows: rows.length });
		} catch (error) {
			next(error);
		}
	});

	/* ── Generic collection import: POST /bulk-import/:collection ────── */
	router.post('/:collection', upload.single('file'), async (req, res, next) => {
		if (!requireAdmin(req, res)) return;
		const { collection } = req.params;
		if (collection.startsWith('directus_')) {
			return res.status(403).json({ errors: [{ message: 'System collections cannot be bulk-imported.' }] });
		}
		if (!req.file) {
			return res.status(400).json({ errors: [{ message: 'No file uploaded (expected form field "file").' }] });
		}
		try {
			const schema = await getSchema();
			if (!schema.collections[collection]) {
				return res.status(404).json({ errors: [{ message: `Unknown collection "${collection}".` }] });
			}
			const collectionsService = new CollectionsService({ schema, accountability: req.accountability });
			const itemsService = new ItemsService(collection, { schema, accountability: req.accountability });
			const fields = describeFields(schema, schema.relations, collection);
			const fieldNames = new Set(fields.map((f) => f.field));

			// Build id-lookups for every m2o relation column up front (one query
			// per related collection, not per row).
			const relationLookups = {};
			for (const f of fields.filter((f) => f.relatedCollection)) {
				const displayField = await pickDisplayField(collectionsService, schema, f.relatedCollection);
				const relatedItemsService = new ItemsService(f.relatedCollection, { schema, accountability: req.accountability });
				relationLookups[f.field] = { displayField, map: await buildLookup(relatedItemsService, displayField) };
			}

			// A field is treated as the natural "re-import key" if it's the
			// collection's own unique constraint (from the real DB schema, not
			// Directus's internal getSchema() snapshot — see comment above) —
			// re-uploading then updates instead of duplicating.
			const uniqueFieldsInDb = await getUniqueSingleColumnFields(database, collection);
			const uniqueField = [...fieldNames].find((f) => uniqueFieldsInDb.has(f)) || null;

			const { rows } = await readSheet(req.file.buffer);
			if (rows.length === 0) {
				return res.status(400).json({ errors: [{ message: 'The file has no data rows.' }] });
			}

			let existingByKey = new Map();
			if (uniqueField) {
				const existing = await itemsService.readByQuery({ fields: ['*'], limit: -1 });
				const pk = schema.collections[collection].primary;
				existingByKey = new Map(existing.map((r) => [String(r[uniqueField]).trim().toLowerCase(), r[pk]]));
			}

			let created = 0, updated = 0;
			const skipped = [];
			for (const { rowNumber, obj } of rows) {
				try {
					const payload = {};
					for (const [key, raw] of Object.entries(obj)) {
						if (!fieldNames.has(key) || raw === '') continue;
						const lookup = relationLookups[key];
						if (lookup) {
							const id = lookup.map.get(raw.trim().toLowerCase());
							if (id == null) {
								throw new Error(`"${raw}" not found in ${key} (matched against ${lookup.displayField})`);
							}
							payload[key] = id;
						} else {
							payload[key] = raw;
						}
					}
					if (Object.keys(payload).length === 0) {
						skipped.push({ row: rowNumber, reason: 'No recognized columns had a value.' });
						continue;
					}
					const key = uniqueField ? String(obj[uniqueField] || '').trim().toLowerCase() : null;
					const existingId = key && existingByKey.get(key);
					if (existingId != null) {
						await itemsService.updateOne(existingId, payload);
						updated++;
					} else {
						await itemsService.createOne(payload);
						created++;
					}
				} catch (rowError) {
					skipped.push({ row: rowNumber, reason: rowError.message });
				}
			}

			res.json({ collection, created, updated, skipped, totalRows: rows.length });
		} catch (error) {
			next(error);
		}
	});
};
