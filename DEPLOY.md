# DEPLOY.md

## Current Status

- Canonical deployment path identified
- Hosting is a static site served by Apache on Roman's server
- Production host serves files directly from the git working tree

## Environments

- Local: `/Users/romangolik/CC_projects/click_travel_new/project`
- Preview: same as local unless a separate preview target is introduced later
- Production server: `root@85.193.86.237`
- Production path: `/var/www/click_travel_new`
- Domain: `clicktravel.click`
- Web server: `apache2`

## Commands

- Open locally: static HTML files in browser or local preview server
- Test: manual UX validation across affected screens
- Deploy:
  - `ssh -i ~/.ssh/id_ed25519 root@85.193.86.237 'git -C /var/www/click_travel_new pull --ff-only origin main'`
- Config test:
  - `ssh -i ~/.ssh/id_ed25519 root@85.193.86.237 'apachectl configtest'`
- Reload:
  - usually not required for content-only static updates
  - if Apache config changed: `ssh -i ~/.ssh/id_ed25519 root@85.193.86.237 'systemctl reload apache2'`
- Canonical checks:
  - `ssh -i ~/.ssh/id_ed25519 root@85.193.86.237 'curl -I -H "Host: clicktravel.click" http://127.0.0.1/ | sed -n "1,12p"'`
  - `ssh -i ~/.ssh/id_ed25519 root@85.193.86.237 'curl -Ik https://clicktravel.click/ | sed -n "1,12p"'`
- Logs:
  - access: `/var/log/apache2/click_travel_new_access.log`
  - error: `/var/log/apache2/click_travel_new_error.log`
- Rollback:
  - `ssh -i ~/.ssh/id_ed25519 root@85.193.86.237 'cd /var/www/click_travel_new && git log --oneline -5'`
  - then `git reset --hard <known-good-sha>` only if explicitly approved
  - safer preferred path: revert in git locally, push, then pull on server

## Smoke Test

- Follow `SMOKE_CHECKLIST.md`
- Run Codex technical smoke review
- Run short human visual check for affected screens
- After deploy, follow `DEPLOY_VERIFY.md`

## Server Configuration

- Apache vhost HTTP: `/etc/apache2/sites-available/click_travel_new.conf`
- Apache vhost HTTPS: `/etc/apache2/sites-available/click_travel_new-le-ssl.conf`
- Enabled sites:
  - `/etc/apache2/sites-enabled/click_travel_new.conf`
  - `/etc/apache2/sites-enabled/click_travel_new-le-ssl.conf`
- DocumentRoot: `/var/www/click_travel_new`
- Canonical host policy:
  - only `clicktravel.click` is served by this project
  - HTTP requests are redirected to `https://clicktravel.click`
  - do not add `www` or legacy `painai.online` aliases unless explicitly requested
- SSL certificate:
  - `/etc/letsencrypt/live/clicktravel.click/fullchain.pem`
  - `/etc/letsencrypt/live/clicktravel.click/privkey.pem`

## Notes

- Server repo remote currently uses HTTPS GitHub remote
- Current production site appears to serve directly from the checked-out branch in `/var/www/click_travel_new`
- For normal static content deploys, `git pull --ff-only origin main` is the canonical release step
- `painai.online` is intentionally detached from this project and may be reused later for another pet project
