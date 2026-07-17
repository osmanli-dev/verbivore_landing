export default ({ embed }) => {
	// Must be an external same-origin <script src>, not inline — Directus's
	// admin CSP (script-src 'self') blocks inline <script> bodies outright.
	embed('body', '<script src="/bulk-import/_client.js"></script>');
};
