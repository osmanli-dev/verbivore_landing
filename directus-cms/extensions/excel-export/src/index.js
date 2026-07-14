import ExcelJS from 'exceljs';
import { CLIENT_SCRIPT } from './client-script.js';

export default (router, { services, getSchema }) => {
	const { ItemsService, CollectionsService } = services;

	// Served as a same-origin external script so it passes Directus's CSP
	// (script-src 'self' — no 'unsafe-inline', so a raw <script> embed is blocked).
	router.get('/_client.js', (_req, res) => {
		res.type('application/javascript').send(CLIENT_SCRIPT);
	});

	router.get('/:collection', async (req, res, next) => {
		const { collection } = req.params;

		if (collection.startsWith('directus_')) {
			return res.status(403).json({ errors: [{ message: 'System collections cannot be exported.' }] });
		}

		try {
			const schema = await getSchema();

			if (!schema.collections[collection]) {
				return res.status(404).json({ errors: [{ message: `Unknown collection "${collection}".` }] });
			}

			const collectionsService = new CollectionsService({ schema, accountability: req.accountability });
			const collectionInfo = await collectionsService.readOne(collection);

			if (collectionInfo?.meta?.singleton) {
				return res.status(404).json({ errors: [{ message: 'Singleton collections cannot be exported.' }] });
			}

			const fields = Object.values(schema.collections[collection].fields)
				.filter((field) => !field.alias)
				.map((field) => field.field);

			const itemsService = new ItemsService(collection, { schema, accountability: req.accountability });
			const items = await itemsService.readByQuery({ fields, limit: -1 });

			const workbook = new ExcelJS.Workbook();
			const sheet = workbook.addWorksheet(collection.slice(0, 31));
			sheet.columns = fields.map((name) => ({ header: name, key: name, width: 24 }));
			sheet.getRow(1).font = { bold: true };

			for (const item of items) {
				const row = {};
				for (const name of fields) {
					const value = item[name];
					row[name] = value !== null && typeof value === 'object' ? JSON.stringify(value) : value;
				}
				sheet.addRow(row);
			}

			res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
			res.setHeader('Content-Disposition', `attachment; filename="${collection}.xlsx"`);
			await workbook.xlsx.write(res);
			res.end();
		} catch (error) {
			next(error);
		}
	});
};
