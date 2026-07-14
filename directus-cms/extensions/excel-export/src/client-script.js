export const CLIENT_SCRIPT = `
(function () {
	if (window.__verbivoreExcelExportInit) return;
	window.__verbivoreExcelExportInit = true;

	var BUTTON_ID = 'verbivore-excel-export-btn';
	var collectionIsListCache = {};
	var lastPath = '';

	function getListCollection() {
		var m = location.pathname.match(/\\/admin\\/content\\/([^/]+)\\/?$/);
		if (!m) return null;
		var name = decodeURIComponent(m[1]);
		if (name === 'all' || name.indexOf('directus_') === 0) return null;
		return name;
	}

	function removeButton() {
		var el = document.getElementById(BUTTON_ID);
		if (el) el.remove();
	}

	function injectButton(collection) {
		if (document.getElementById(BUTTON_ID)) return;
		var btn = document.createElement('a');
		btn.id = BUTTON_ID;
		btn.href = '/excel-export/' + encodeURIComponent(collection);
		btn.textContent = '⬇ Download Excel';
		btn.setAttribute('download', collection + '.xlsx');
		btn.style.position = 'fixed';
		btn.style.bottom = '24px';
		btn.style.right = '24px';
		btn.style.zIndex = '9999';
		btn.style.background = '#6644FF';
		btn.style.color = '#fff';
		btn.style.padding = '10px 18px';
		btn.style.borderRadius = '8px';
		btn.style.fontFamily = 'system-ui, sans-serif';
		btn.style.fontSize = '14px';
		btn.style.fontWeight = '600';
		btn.style.textDecoration = 'none';
		btn.style.boxShadow = '0 4px 12px rgba(0,0,0,.25)';
		btn.style.cursor = 'pointer';
		document.body.appendChild(btn);
	}

	function check() {
		var collection = getListCollection();
		if (!collection) { removeButton(); return; }

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

		if (collectionIsListCache[collection] === true) injectButton(collection);
		else removeButton();
	}

	function onRouteChange() {
		if (location.pathname === lastPath) return;
		lastPath = location.pathname;
		removeButton();
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
