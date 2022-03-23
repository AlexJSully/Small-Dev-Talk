module.exports = {
  "globDirectory": "./",
  "globPatterns": [
    "**/*.{html,json,jpg,png,mp4,gif,xml,ico,svg,webmanifest,js,css,webp}"
  ],
  "swDest": "./src/serviceWorker/sw.js",
  "globIgnores": [
    'index.html',
    'workbox-config.js',
    'package.json',
    'package-lock.json'
  ]
};