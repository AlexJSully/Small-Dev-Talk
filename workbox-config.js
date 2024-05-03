module.exports = {
	"globDirectory": "./src/",
	"globPatterns": [
		"**/*.{html,json,jpg,png,mp4,gif,xml,ico,svg,webmanifest,js,css,webp}"
	],
	"swDest": "./src/serviceWorker/sw.js",
	"globIgnores": [
		'index.html',
		'workbox-config.js',
		'package.json',
		'package-lock.json',
		'node_modules/**/*',
	],

	// Define runtime caching rules.
	"runtimeCaching": [{
		// Match any request that ends with .png, .jpg, .jpeg, .webp, .ico or .svg
		"urlPattern": /\.(?:png|jpg|jpeg|webp|ico|svg)$/,

		// Apply a cache-first strategy.
		"handler": 'CacheFirst',

		"options": {
			// Use a custom cache name.
			"cacheName": 'images',

			// Only cache 10 images.
			"expiration": {
				"maxEntries": 10,
			},
		},
	}],
};