# Isti & Adrian — Premium Wedding Invitation

Mobile-first static wedding invitation designed for GitHub Pages, with Google Sheets RSVP storage through Google Apps Script.

## Included

- Elegant responsive wedding invitation
- Opening cover + pre-wedding photography
- Bride & groom / parents
- Live countdown
- Event details
- Google Maps link
- Google Calendar "Add to Calendar" link
- RSVP form
- Google Sheets RSVP database
- Wedding wishes loaded from Google Sheets
- Local optimistic/fallback wish storage
- Gift / bank details with copy buttons
- Wedding music with mobile-safe manual play button
- Subtle scroll-reveal animation
- No framework or build step required

## 1. Configure the invitation

Edit `config.js`. The main editable values are grouped under:

- `couple`
- `event`
- `gift`
- `googleAppsScriptUrl`
- `assets`

### Important: exact wedding time

The brief supplied the date but not a clock time. The starter configuration uses **09.00 WIB** as an editable default so the countdown and Google Calendar event have a complete target. Change:

```js
timeLabel: "09.00 WIB",
startISO: "2026-11-15T09:00:00+07:00",
endISO: "2026-11-15T14:00:00+07:00",
```

to the final ceremony/reception time.

## 2. Create the Google Sheet

Create a new Google Sheet, then open:

**Extensions → Apps Script**

Paste the contents of `google-apps-script/Code.gs`.

The script automatically creates a tab named `RSVP` with:

| Column | Meaning |
|---|---|
| Timestamp | Submission time |
| Full Name | Guest name |
| Attendance | Attending / Not Attending |
| Guests | Number attending |
| Message | Wedding wish |

### Deploy the Apps Script

In Apps Script:

1. Click **Deploy → New deployment**
2. Select **Web app**
3. **Execute as:** Me
4. **Who has access:** Anyone
5. Deploy
6. Authorize the script when Google asks
7. Copy the Web app URL ending in `/exec`
8. Paste it into `config.js` as `googleAppsScriptUrl`

Example:

```js
googleAppsScriptUrl: "https://script.google.com/macros/s/XXXXXXXX/exec",
```

Do not put the Google Sheet ID or Apps Script edit URL in the frontend.

## 3. How RSVP synchronization works

The GitHub Pages site sends a URL-encoded POST to Apps Script.

Apps Script appends one new row for every submission.

The wishes section requests public wish data through Apps Script's JSONP endpoint. This avoids the common browser CORS limitations encountered when a static GitHub Pages site communicates with Apps Script.

The frontend also immediately shows the submitted wish locally, so the guest sees feedback without waiting for Google Sheets.

## 4. GitHub Pages deployment

Create a GitHub repository, for example:

`isti-adrian-wedding`

Upload the **contents of this folder** to the repository root.

Then:

1. GitHub → repository → **Settings**
2. **Pages**
3. Source: **Deploy from a branch**
4. Branch: `main`
5. Folder: `/ (root)`
6. Save

GitHub will provide a URL similar to:

`https://YOUR-USERNAME.github.io/isti-adrian-wedding/`

### Optional custom domain

If you own a domain, add it under GitHub Pages → Custom domain and follow GitHub's DNS instructions.

## 5. Assets

Optimized JPEGs are included in `assets/images/`.

The original wedding piano-cover MP3 is included as `assets/audio/wedding-song.mp3`.

The site deliberately does not autoplay audio because iPhone/Android browsers commonly block autoplay until the visitor interacts with the page.

## 6. Maintenance

### Change names / parents
Edit `config.js → couple`.

### Change venue
Edit `config.js → event.address`, `event.venue`, and `event.mapsUrl`.

### Change wedding date/time
Edit `config.js → event.dateLabel`, `event.timeLabel`, `event.startISO`, and `event.endISO`.

### Change gift details
Edit `config.js → gift`.

### Replace photos
Replace files in `assets/images/` using the same filenames, or update the paths in `config.js`.

For best performance, use JPEG/WebP images around 1600–2200 px on the longest edge.

### Replace music
Replace `assets/audio/wedding-song.mp3` and keep the same filename, or update `config.js`.

## 7. Production checklist

- [x] Mobile-first layout
- [x] Responsive desktop layout
- [x] Smooth scrolling
- [x] Premium typography
- [x] Opening cover
- [x] Couple section
- [x] Countdown
- [x] Event details
- [x] Google Maps navigation
- [x] Google Calendar integration
- [x] RSVP fields
- [x] Google Sheets backend
- [x] One spreadsheet row per RSVP
- [x] Wedding wishes
- [x] Gift section
- [x] Copy bank/address buttons
- [x] Closing section
- [x] Music control
- [x] Reduced-motion support
- [x] Lightweight static frontend
- [ ] Paste deployed Apps Script URL into `config.js`
- [ ] Deploy repository to GitHub Pages
- [ ] Replace 09.00 WIB with the final wedding time
- [ ] Test one RSVP from iPhone/Android and confirm the row appears in Google Sheets

## Privacy note

The wishes endpoint is intentionally public so the invitation can display messages without requiring guests to sign in. Do not place private guest data, phone numbers, email addresses, or other sensitive information into the public wish/message field.

## License / client delivery

All code in this starter project is intended for this invitation project. Verify that you have the appropriate rights to use the supplied wedding photography and music for public web publication.
