export const CLIENT_SCRIPT = `
(function () {
	if (window.__verbivoreBulkImportInit) return;
	window.__verbivoreBulkImportInit = true;

	var WRAP_ID = 'verbivore-bulk-import-wrap';
	var collectionIsListCache = {};
	var lastPath = '';

	function getListCollection() {
		var m = location.pathname.match(/\\/admin\\/content\\/([^/]+)\\/?$/);
		if (!m) return null;
		var name = decodeURIComponent(m[1]);
		if (name === 'all' || name.indexOf('directus_') === 0) return null;
		return name;
	}

	function removeWrap() {
		var el = document.getElementById(WRAP_ID);
		if (el) el.remove();
	}

	function style(el, styles) {
		for (var k in styles) el.style[k] = styles[k];
	}

	function makeBtn(label, bg) {
		var b = document.createElement('button');
		b.textContent = label;
		b.type = 'button';
		style(b, {
			background: bg, color: '#fff', padding: '10px 16px', borderRadius: '8px',
			fontFamily: 'system-ui, sans-serif', fontSize: '13px', fontWeight: '600',
			border: '0', boxShadow: '0 4px 12px rgba(0,0,0,.25)', cursor: 'pointer',
			display: 'inline-block',
		});
		return b;
	}

	function doDownload(url, filename) {
		fetch(url, { credentials: 'include' })
			.then(function (r) {
				if (!r.ok) throw new Error('Server returned ' + r.status);
				return r.blob();
			})
			.then(function (blob) {
				var a = document.createElement('a');
				a.href = URL.createObjectURL(blob);
				a.download = filename;
				document.body.appendChild(a);
				a.click();
				setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
			})
			.catch(function (e) { showResult('Download Failed', { errors: [{ message: e.message }] }); });
	}

	function showResult(title, data) {
		var overlay = document.createElement('div');
		style(overlay, {
			position: 'fixed', inset: '0', background: 'rgba(8,18,37,.55)', zIndex: '10001',
			display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif',
		});
		var box = document.createElement('div');
		style(box, {
			background: '#fff', borderRadius: '12px', padding: '24px', maxWidth: '480px', width: '90%',
			maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.35)',
		});
		var h = document.createElement('h2');
		h.textContent = title;
		style(h, { margin: '0 0 12px', fontSize: '17px', color: '#172054' });
		box.appendChild(h);

		if (data.errors) {
			var errP = document.createElement('p');
			errP.textContent = data.errors.map(function (e) { return e.message; }).join(' ');
			style(errP, { color: '#c0392b', fontSize: '14px' });
			box.appendChild(errP);
		} else {
			var summary = document.createElement('p');
			var parts = [];
			if (data.created != null) parts.push(data.created + ' created');
			if (data.updated != null) parts.push(data.updated + ' updated');
			if (data.editions) parts.push(data.editions.length + ' edition(s) updated (' + data.editions.reduce(function (s, e) { return s + e.countriesUpdated; }, 0) + ' country delegations)');
			if (data.skipped && data.skipped.length) parts.push(data.skipped.length + ' skipped');
			summary.textContent = parts.join(', ') + ' — out of ' + data.totalRows + ' row(s).';
			style(summary, { fontSize: '14px', color: '#333', marginBottom: '10px' });
			box.appendChild(summary);

			if (data.skipped && data.skipped.length) {
				var list = document.createElement('ul');
				style(list, { fontSize: '13px', color: '#c0392b', paddingLeft: '18px', margin: '0' });
				data.skipped.slice(0, 25).forEach(function (s) {
					var li = document.createElement('li');
					li.textContent = (s.row ? 'Row ' + s.row + ': ' : '') + s.reason;
					list.appendChild(li);
				});
				box.appendChild(list);
				if (data.skipped.length > 25) {
					var more = document.createElement('p');
					more.textContent = '...and ' + (data.skipped.length - 25) + ' more.';
					style(more, { fontSize: '12px', color: '#888' });
					box.appendChild(more);
				}
			}
		}

		var closeBtn = document.createElement('button');
		closeBtn.textContent = 'Close';
		style(closeBtn, {
			marginTop: '18px', background: '#172054', color: '#fff', border: '0', borderRadius: '8px',
			padding: '10px 18px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
		});
		closeBtn.onclick = function () { overlay.remove(); location.reload(); };
		box.appendChild(closeBtn);
		overlay.appendChild(box);
		document.body.appendChild(overlay);
	}

	function doUpload(endpoint, label) {
		var input = document.createElement('input');
		input.type = 'file';
		input.accept = '.xlsx';
		input.onchange = function () {
			var file = input.files[0];
			if (!file) return;
			var fd = new FormData();
			fd.append('file', file);
			var btn = document.getElementById(WRAP_ID);
			if (btn) btn.style.opacity = '.5';
			fetch(endpoint, { method: 'POST', body: fd, credentials: 'include' })
				.then(function (r) { return r.json().then(function (json) { return { ok: r.ok, json: json }; }); })
				.then(function (res) { showResult(label + ' — ' + (res.ok ? 'Done' : 'Failed'), res.json); })
				.catch(function (e) { showResult(label + ' — Failed', { errors: [{ message: e.message }] }); })
				.finally(function () { if (btn) btn.style.opacity = '1'; });
		};
		input.click();
	}

	function injectWrap(collection) {
		if (document.getElementById(WRAP_ID)) return;
		var wrap = document.createElement('div');
		wrap.id = WRAP_ID;
		style(wrap, {
			position: 'fixed', bottom: '24px', right: '190px', zIndex: '9999',
			display: 'flex', gap: '8px', alignItems: 'center',
		});

		var importBtn = makeBtn('⬆ Import Excel', '#ff821a');
		importBtn.onclick = function () { doUpload('/bulk-import/' + encodeURIComponent(collection), 'Import into ' + collection); };
		wrap.appendChild(importBtn);

		var tplBtn = makeBtn('📥 Template', '#17205a');
		tplBtn.onclick = function () { doDownload('/bulk-import/template/' + encodeURIComponent(collection), collection + '-import-template.xlsx'); };
		wrap.appendChild(tplBtn);

		if (collection === 'editions') {
			var resultsBtn = makeBtn('🏆 Import Results', '#2fcf7f');
			resultsBtn.onclick = function () { doUpload('/bulk-import/results', 'Import Results'); };
			wrap.appendChild(resultsBtn);

			var resultsTplBtn = makeBtn('📥 Results Template', '#17205a');
			resultsTplBtn.onclick = function () { doDownload('/bulk-import/template/results', 'results-import-template.xlsx'); };
			wrap.appendChild(resultsTplBtn);
		}

		document.body.appendChild(wrap);
	}

	function check() {
		var collection = getListCollection();
		if (!collection) { removeWrap(); return; }

		if (collectionIsListCache[collection] === undefined) {
			collectionIsListCache[collection] = 'pending';
			fetch('/collections/' + encodeURIComponent(collection), { credentials: 'include' })
				.then(function (r) { return r.ok ? r.json() : null; })
				.then(function (json) {
					var isSingleton = !!(json && json.data && json.data.meta && json.data.meta.singleton);
					collectionIsListCache[collection] = !isSingleton;
					check();
				})
				.catch(function () { collectionIsListCache[collection] = false; });
			return;
		}

		if (collectionIsListCache[collection] === true) injectWrap(collection);
		else removeWrap();
	}

	function onRouteChange() {
		if (location.pathname === lastPath) return;
		lastPath = location.pathname;
		removeWrap();
		check();
	}

	var origPushState = history.pushState;
	history.pushState = function () {
		origPushState.apply(this, arguments);
		onRouteChange();
	};
	var origReplaceState = history.replaceState;
	history.replaceState = function () {
		origReplaceState.apply(this, arguments);
		onRouteChange();
	};
	window.addEventListener('popstate', onRouteChange);

	setInterval(onRouteChange, 800);
	onRouteChange();
})();
`;
