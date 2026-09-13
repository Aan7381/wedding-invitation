# Deployment quick start

1. Open `config.js`.
2. Set the final wedding time in `event`.
3. Create Google Sheet → Extensions → Apps Script.
4. Paste `google-apps-script/Code.gs`.
5. Deploy as Web app, Execute as Me, access Anyone.
6. Paste `/exec` URL into `googleAppsScriptUrl`.
7. Test GET by opening the Apps Script `/exec?action=wishes` URL in a browser.
8. Upload the project root to GitHub.
9. Enable GitHub Pages from `main` / root.
10. Submit a real test RSVP and verify a new row appears in the `RSVP` tab.

## Google Calendar behavior

The invitation generates a Google Calendar template URL with:
- Title
- Start/end time
- Venue
- Address
- Description

Guests click **Add to Google Calendar**, review it, and save it to their own calendar.

## Apps Script update behavior

If you edit `Code.gs` after deploying, create a new deployment version or update the existing deployment so the `/exec` endpoint uses the latest code.
