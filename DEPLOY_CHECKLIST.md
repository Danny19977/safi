# Cafe SAFI — Deployment Checklist

Follow these steps every time you upload changes to cPanel via FileZilla.

---

## Step 1 — Bump the cache version (local)

Open PowerShell in the project root and run:

```powershell
pwsh -ExecutionPolicy Bypass -File .\scripts\bump-cache-version.ps1 -Version YYYYMMDD_v1
```

Replace `YYYYMMDD` with today's date (e.g. `20260427v1`).  
If you deploy a second time the same day, use `v2`, `v3`, etc.

**Optional dry-run (preview only, no files changed):**
```powershell
pwsh -ExecutionPolicy Bypass -File .\scripts\bump-cache-version.ps1 -Version 20260427v1 -DryRun
```

**Include PHP files too:**
```powershell
pwsh -ExecutionPolicy Bypass -File .\scripts\bump-cache-version.ps1 -Version 20260427v1 -IncludePhp
```

---

## Step 2 — Verify changes locally

- Open the site in XAMPP (`http://localhost/Cafe SAFI/`).
- Confirm your changes look correct.
- Open browser DevTools → Network tab → verify no console errors.

---

## Step 3 — Upload via FileZilla

1. Connect to your cPanel FTP.
2. Navigate to the correct root folder (e.g. `public_html/`).
3. Select all changed files and upload.
4. **FileZilla settings:** Transfers → Default file exists action → **Overwrite**.
5. After upload, check the remote file **Size** and **Date** in FileZilla to confirm files are updated.

### Files to always upload after any change:
| Changed locally | Upload to server |
|---|---|
| `*.html` | Yes — always after running bump script |
| `css/*.css` | Yes — if CSS was changed |
| `js/*.js` | Yes — if JS was changed |
| `php/*.php` | Yes — if PHP was changed |
| `images/` or `img/` | Yes — if images were added/replaced |
| `.htaccess` | Only if changed |

---

## Step 4 — Clear server-side cache (if applicable)

- **Cloudflare:** Caching → Purge Everything (or purge specific URLs).
- **cPanel LiteSpeed Cache:** cPanel → LiteSpeed Cache → Flush All.
- **cPanel PHP OPcache:** cPanel → Software → PHP OPcache → Restart (if PHP files changed).

---

## Step 5 — Verify online

1. Open the live URL in a **private/incognito** window.
2. Hard refresh: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac).
3. Open DevTools → Network tab → check that asset URLs have the new `?v=YYYYMMDD` version.
4. Confirm changes are visible.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Old content still showing | Hard refresh (`Ctrl+F5`) or open in incognito |
| Assets still cached | Verify version bump was run and HTML files were uploaded |
| PHP changes not visible | Restart PHP OPcache in cPanel or wait ~5 min |
| Upload seems stuck in FileZilla | Disconnect and reconnect, then retry |
| Changes visible locally but not online | Wrong upload folder — confirm document root in cPanel Domains |

---

## Version History

| Version | Date | Notes |
|---|---|---|
| 20260309v2 | 2026-03-09 | Initial versioning setup |
| 20260427v1 | 2026-04-27 | Cache-busting automation added |
