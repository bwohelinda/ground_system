# Frontend Folder

This folder is intended to contain all frontend applications grouped together:

- `frontend/cricket-booking`
- `frontend/admin-panel`
- `frontend/registration-portal`

Automated move (PowerShell) — run from repository root to move existing folders into `frontend/`:

```powershell
mkdir frontend -Force
Move-Item -Path admin-panel -Destination frontend\admin-panel -Force
Move-Item -Path cricket-booking -Destination frontend\cricket-booking -Force
Move-Item -Path registration-portal -Destination frontend\registration-portal -Force
```

If you'd prefer I perform the move now (create copies under `frontend/` and leave backups), tell me and I'll proceed.

Frontend shell:

 - `frontend/index.html` is a lightweight shell that embeds the three apps (booking/admin/registration) via iframes.

Now consolidated:

 - The three apps have been merged into `frontend/app` (their `src` and `public` folders moved inside `frontend/app`).
 - Start the consolidated frontend from the repo root:

```powershell
npm run install-all
npm run start:frontend
```

Notes:

 - The original app `package.json` files were preserved as `frontend/app/package.*.json` for reference.
 - If you want the iframe shell instead, open `frontend/index.html` after running each app separately (not necessary after consolidation).
