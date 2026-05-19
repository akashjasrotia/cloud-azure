# Nearby Jobs — Simple Static Finder

This is a tiny static project that helps you find jobs near you by keyword and radius. It runs fully in the browser and does not use any database or backend.

Files added:

- `index.html` — the page
- `css/styles.css` — basic styles
- `js/app.js` — application logic and a small local jobs dataset

How to use

1. Open `index.html` in your browser (double-click or use the browser's File -> Open).
2. Click `Use my location` to allow the browser to get your GPS coordinates (optional). If you decline, click `Use sample location` to test.
3. Enter keywords, adjust the radius, and click `Search`.

Privacy

All location calculations happen locally in your browser. No data is sent anywhere.

Notes and next steps

- You can replace the `jobs` array in `js/app.js` with a larger static list or fetch a JSON file.
- For production use, you'd normally call a jobs API and implement server-side filtering and caching.
