// In-place text editor for the portfolio.
//
// Turns every piece of text that came out of projects.json into an editable
// field, then writes the changes back into projects.json through the local dev
// server (tools/edit-server.js).
//
// Only ever active on localhost — there is deliberately no way to switch it on
// from the deployed site, so visitors never see the editing UI. Turn it off
// locally with ?edit=0. Loads before app.js / project.js so the renderers can
// tag elements with the JSON path they came from.
(function () {
    'use strict';

    const params = new URLSearchParams(location.search);
    const isLocal = ['localhost', '127.0.0.1', '[::1]', ''].includes(location.hostname);
    const enabled = isLocal && params.get('edit') !== '0';

    // Renderers call this to stamp an element with its JSON path. When editing
    // is off it returns an empty string, so the published markup is untouched.
    window.__EDIT_MODE__ = enabled;
    window.editAttr = enabled
        ? (path, type = 'text') => ` data-edit="${path}" data-edit-type="${type}"`
        : () => '';

    if (!enabled) return;

    const SAVE_URL = '/__api/save';
    const PING_URL = '/__api/ping';
    const DATA_FILE = 'projects.json';

    // path -> new value, for every field that differs from what was loaded
    const dirty = new Map();
    let ui = null;

    /* ------------------------------------------------------------------ */
    /* reading + writing values                                            */
    /* ------------------------------------------------------------------ */

    // Fields marked type="html" keep their inline markup (<strong>, <em>, <a>).
    // Everything else is plain text.
    function readValue(el) {
        if (el.dataset.editType === 'html') {
            return el.innerHTML
                .replace(/<br\s*\/?>/gi, ' ')
                .replace(/&nbsp;/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        }
        return el.textContent.replace(/\s+/g, ' ').trim();
    }

    function writeValue(el, value) {
        if (el.dataset.editType === 'html') el.innerHTML = value;
        else el.textContent = value;
    }

    function markState(el) {
        const path = el.dataset.edit;
        const current = readValue(el);

        if (current === el.dataset.editBaseline) {
            dirty.delete(path);
            el.classList.remove('is-dirty');
        } else {
            dirty.set(path, current);
            el.classList.add('is-dirty');
        }
        renderStatus();
    }

    /* ------------------------------------------------------------------ */
    /* making elements editable                                            */
    /* ------------------------------------------------------------------ */

    function attach(el) {
        if (el.dataset.editReady) return;
        el.dataset.editReady = '1';
        el.dataset.editBaseline = readValue(el);
        // Plain fields reject rich formatting outright rather than silently
        // dropping it on save. Assigning an unsupported value throws, so fall
        // back to plain contentEditable on browsers without plaintext-only.
        try {
            el.contentEditable = el.dataset.editType === 'html' ? 'true' : 'plaintext-only';
        } catch {
            el.contentEditable = 'true';
        }
        el.spellcheck = true;
        el.classList.add('editable-field');

        // An unsaved edit that is still in the dirty map (a re-render after a
        // failed save, say) should come back showing the edited text.
        if (dirty.has(el.dataset.edit)) {
            writeValue(el, dirty.get(el.dataset.edit));
            el.classList.add('is-dirty');
        }

        el.addEventListener('input', () => markState(el));

        el.addEventListener('keydown', e => {
            // Every field is a single JSON string — no newlines to insert.
            if (e.key === 'Enter') {
                e.preventDefault();
                el.blur();
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                writeValue(el, el.dataset.editBaseline);
                markState(el);
                el.blur();
            }
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                save();
            }
        });

        // Paste as plain text so copied styling never leaks into the JSON.
        el.addEventListener('paste', e => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text/plain');
            document.execCommand('insertText', false, text.replace(/\s+/g, ' '));
        });

        // Project cards are wrapped in <a>; clicking to place the caret must
        // not navigate away. Clicks anywhere else on the card still work.
        el.addEventListener('click', e => {
            if (el.closest('a')) e.preventDefault();
        });
    }

    function scan(root) {
        (root.querySelectorAll ? root.querySelectorAll('[data-edit]') : []).forEach(attach);
        if (root.matches && root.matches('[data-edit]')) attach(root);
    }

    /* ------------------------------------------------------------------ */
    /* saving                                                              */
    /* ------------------------------------------------------------------ */

    function patchList() {
        return [...dirty].map(([path, value]) => ({ path, value }));
    }

    async function save() {
        if (dirty.size === 0) {
            flash('Nothing to save');
            return;
        }

        const patches = patchList();
        ui.save.disabled = true;

        try {
            const response = await fetch(SAVE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patches })
            });

            const result = await response.json();
            if (!response.ok || !result.ok) throw new Error(result.error || `HTTP ${response.status}`);

            if (result.rejected && result.rejected.length) {
                console.warn('Some edits were rejected:', result.rejected);
                flash(`Saved ${result.applied.length}, rejected ${result.rejected.length} — see console`, true);
            } else {
                flash(`Saved ${patches.length} edit${patches.length === 1 ? '' : 's'} to ${DATA_FILE}`);
            }

            commit(patches);
        } catch (error) {
            // Served on localhost by something other than tools/edit-server.js
            // (a plain static server, say): hand over a patched projects.json
            // rather than losing the edits.
            console.warn('Save endpoint unavailable, falling back to download:', error.message);
            await downloadPatchedFile(patches);
        } finally {
            ui.save.disabled = false;
        }
    }

    function commit(patches) {
        patches.forEach(({ path, value }) => {
            document.querySelectorAll(`[data-edit="${path}"]`).forEach(el => {
                el.dataset.editBaseline = value;
                el.classList.remove('is-dirty');
            });
            dirty.delete(path);
        });
        renderStatus();
    }

    function setByPath(data, dotted, value) {
        const parts = dotted.split('.');
        let node = data;
        for (let i = 0; i < parts.length - 1; i++) {
            if (node === null || typeof node !== 'object') return false;
            node = node[Array.isArray(node) ? Number(parts[i]) : parts[i]];
        }
        if (node === null || typeof node !== 'object') return false;
        const key = Array.isArray(node) ? Number(parts[parts.length - 1]) : parts[parts.length - 1];
        if (!(key in node)) return false;
        node[key] = value;
        return true;
    }

    async function downloadPatchedFile(patches) {
        try {
            const data = await (await fetch(DATA_FILE, { cache: 'no-store' })).json();
            patches.forEach(({ path, value }) => setByPath(data, path, value));

            const blob = new Blob([JSON.stringify(data, null, 4) + '\n'], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = DATA_FILE;
            link.click();
            URL.revokeObjectURL(link.href);

            flash('No edit server — downloaded a patched projects.json instead', true);
            commit(patches);
        } catch (error) {
            flash(`Save failed: ${error.message}`, true);
        }
    }

    function revert() {
        if (dirty.size === 0) return;
        if (!confirm(`Discard ${dirty.size} unsaved edit${dirty.size === 1 ? '' : 's'}?`)) return;

        document.querySelectorAll('[data-edit].is-dirty').forEach(el => {
            writeValue(el, el.dataset.editBaseline);
            el.classList.remove('is-dirty');
        });
        dirty.clear();
        renderStatus();
    }

    /* ------------------------------------------------------------------ */
    /* toolbar                                                             */
    /* ------------------------------------------------------------------ */

    function buildToolbar() {
        const bar = document.createElement('div');
        bar.className = 'edit-toolbar';
        bar.innerHTML = `
            <span class="edit-dot" title="checking for edit server"></span>
            <span class="edit-label">Edit mode</span>
            <span class="edit-count">no changes</span>
            <button class="edit-btn edit-save" type="button">Save <kbd>⌘S</kbd></button>
            <button class="edit-btn edit-revert" type="button">Discard</button>
            <button class="edit-btn edit-exit" type="button" title="Leave edit mode">Done</button>
            <span class="edit-flash"></span>
        `;
        document.body.appendChild(bar);

        ui = {
            bar,
            dot: bar.querySelector('.edit-dot'),
            count: bar.querySelector('.edit-count'),
            save: bar.querySelector('.edit-save'),
            flash: bar.querySelector('.edit-flash')
        };

        ui.save.addEventListener('click', save);
        bar.querySelector('.edit-revert').addEventListener('click', revert);
        bar.querySelector('.edit-exit').addEventListener('click', () => {
            if (dirty.size && !confirm(`${dirty.size} unsaved edit(s) will be lost. Leave edit mode?`)) return;
            dirty.clear();
            const url = new URL(location.href);
            url.searchParams.set('edit', '0');
            location.href = url.toString();
        });
    }

    function renderStatus() {
        if (!ui) return;
        const n = dirty.size;
        ui.count.textContent = n === 0 ? 'no changes' : `${n} unsaved`;
        ui.count.classList.toggle('has-changes', n > 0);
        ui.save.disabled = n === 0;
    }

    let flashTimer;
    function flash(message, isWarning = false) {
        if (!ui) return;
        ui.flash.textContent = message;
        ui.flash.classList.toggle('is-warning', isWarning);
        ui.flash.classList.add('show');
        clearTimeout(flashTimer);
        flashTimer = setTimeout(() => ui.flash.classList.remove('show'), 4000);
    }

    /* ------------------------------------------------------------------ */
    /* boot                                                                */
    /* ------------------------------------------------------------------ */

    function init() {
        document.body.classList.add('edit-mode');

        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = 'css/editor.css';
        document.head.appendChild(styles);

        buildToolbar();
        renderStatus();

        // Both pages build their content asynchronously after fetching the
        // JSON, so watch for it rather than assuming it is already there.
        scan(document);
        new MutationObserver(mutations => {
            mutations.forEach(m => m.addedNodes.forEach(node => {
                if (node.nodeType === 1) scan(node);
            }));
        }).observe(document.body, { childList: true, subtree: true });

        document.addEventListener('keydown', e => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                save();
            }
        });

        window.addEventListener('beforeunload', e => {
            if (dirty.size === 0) return;
            e.preventDefault();
            e.returnValue = '';
        });

        fetch(PING_URL, { cache: 'no-store' })
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(info => {
                ui.dot.classList.add('is-live');
                ui.dot.title = `Saving to ${info.file}`;
            })
            .catch(() => {
                ui.dot.title = 'No edit server — Save will download a patched projects.json';
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
