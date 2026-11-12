module.exports = {
	"globDirectory": "./",
	// Precache only the app shell. Article markdown and images are cached at runtime as they are read.
	"globPatterns": [
		"index.html",
		"src/style.min.css",
		"src/scripts/index.min.js",
		"src/scripts/libraries/jquery/jquery.min.js",
		"src/scripts/libraries/bootstrap/css/bootstrap.min.css",
		"src/scripts/libraries/bootstrap/js/bootstrap.bundle.min.js",
		"src/scripts/libraries/showdown/showdown.min.js",
		"src/articleArchive/articleData.json",
		"src/legacyPages/legacyPagesDisplay.json",
		"src/images/title.svg",
		"src/images/shade.png",
		"src/icon/favicon.ico",
		"src/icon/favicon-16x16.png",
		"src/icon/favicon-32x32.png",
		"src/icon/site.webmanifest",
	],
	// The worker must sit at the site root so its scope covers index.html.
	"swDest": "./sw.js",

	// Pages are addressed as index.html?ArticleKey, so match precached URLs with every query parameter removed.
	"ignoreURLParametersMatching": [/.*/],

	// On a first visit the page loads before the worker exists. Claiming lets the worker control that page as soon as it
	// activates, so the article and images it fetches next go through the runtime caches.
	"clientsClaim": true,

	// Define runtime caching rules.
	"runtimeCaching": [
		{
			// Match any request that ends with .png, .jpg, .jpeg, .gif, .webp, .ico or .svg
			"urlPattern": /\.(?:png|jpg|jpeg|gif|webp|ico|svg)$/,

			// Apply a cache-first strategy.
			"handler": 'CacheFirst',

			"options": {
				// Use a custom cache name.
				"cacheName": 'images',

				// Keep the images of the last few articles read.
				"expiration": {
					"maxEntries": 100,
					"purgeOnQuotaError": true,
				},
			},
		},
		{
			// Article markdown: the network copy when online, the last copy read when offline.
			"urlPattern": /\/src\/articleArchive\/.*\.md$/,

			"handler": 'NetworkFirst',

			"options": {
				"cacheName": 'articles',

				"expiration": {
					"maxEntries": 50,
				},
			},
		},
	],
};
