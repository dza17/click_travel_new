# DEPLOY_VERIFY.md

## Purpose

Use this file after each deploy to confirm that production serves the expected version, not just HTTP 200.

## Standard Deploy Verification

1. Confirm push:
   - `git log --oneline -1`
   - `origin/main` contains the intended release commit

2. Confirm server fast-forward:
   - `ssh painai 'git -C /var/www/click_travel_new rev-parse --short HEAD'`
   - server HEAD must match the deployed commit

3. Confirm production content markers:
   - verify one or more exact HTML/JS markers introduced by the release
   - do not rely only on status code or `Last-Modified`

4. Confirm one critical user-visible flow:
   - one short human visual pass on the affected screen

5. Confirm canonical host behavior:
   - `http://clicktravel.click` redirects to `https://clicktravel.click`
   - production HTTPS responds on `clicktravel.click`
   - no verification should rely on `painai.online`

## Current Canonical Checks For Click Travel

- Server repo path:
  - `/var/www/click_travel_new`

- Production URL:
  - `https://clicktravel.click`

- Useful commands:
  - `ssh painai 'git -C /var/www/click_travel_new rev-parse --short HEAD'`
  - `ssh painai 'curl -I -H "Host: clicktravel.click" http://127.0.0.1/ | sed -n "1,12p"'`
  - `ssh painai 'curl -s https://clicktravel.click/passenger_details.html | grep -n "marker"'`
  - `ssh painai 'curl -Ik https://clicktravel.click/passenger_details.html | sed -n "1,12p"'`

## Rule

Do not mark deploy as complete until:
- server HEAD is correct
- one exact marker is confirmed in the served HTML/JS
- canonical host checks match `clicktravel.click`
- one critical affected flow is checked visually when the change is user-facing
