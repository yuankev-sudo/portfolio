# Editing content in the browser

Text on the site comes from `projects.json`. Instead of hand-editing that file,
you can edit the words in place on the page and have them written back.

```
node tools/edit-server.js      # → http://localhost:4321
```

Open the site at that address. Edit mode turns on automatically on localhost:
every string that came from `projects.json` becomes clickable. Type over it and
press **⌘S** (or click **Save**) to write the change into `projects.json`.

| | |
|---|---|
| **Blue dashed outline** | editable field |
| **Amber outline** | edited, not yet saved |
| **Green dot in the toolbar** | connected to the save server |
| **Enter** | commits the field (values are single lines) |
| **Esc** | reverts the field you're in |
| **Discard** | reverts everything unsaved |
| **Done** | leaves edit mode (adds `?edit=0`) |
| **⌘S** | saves every changed field at once |

## What's editable

Project titles, numbers, dates, descriptions, subtitles, tags and tech tags,
role/timeline/team, every section heading, paragraph and bullet, image and video
captions, and results metrics — 386 fields in all.

Deliberately not editable: `id`, `category`, `type`, `layout`, image/video paths,
and `alt` text. Those are structural or invisible, and changing them from the
page would break links or regroup the site. Edit `projects.json` directly for
those, and for adding or deleting projects, sections and list items.

Bold and links survive inside paragraphs and bullets (those fields hold HTML).
Pasted text is always inserted as plain text.

## Notes

- Every save writes the previous file to `.projects.json.bak` first, then swaps
  the new file in atomically. The formatting matches the existing file, so a
  save shows up in `git diff` as only the lines you actually changed.
- The save endpoint only overwrites strings that already exist at a known path;
  it never creates keys. Unknown paths come back in `rejected`.
- Edit mode only ever turns on for `localhost`. There is no way to switch it on
  from yuankev.com, so visitors never see the editing UI. On the deployed site
  `js/editor.js` exits immediately and `css/editor.css` is never fetched.
- Nothing in the browser can write to the site anyway: the save endpoint lives
  in `tools/edit-server.js`, which runs on your machine and is never deployed.
- If you serve the folder on localhost with something *other* than
  `tools/edit-server.js` (a plain `python3 -m http.server`, say), editing still
  works but **Save** downloads a patched `projects.json` instead of writing it.
- After saving, commit and push — GitHub Pages builds from `main`, so the change
  goes live about a minute after `git push`.
