# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

To see tags and releases, please go to [Tags](https://github.com/AlexJSully/Small-Dev-Talk/tags) on [GitHub](https://github.com/AlexJSully/Small-Dev-Talk).

## [1.3.4] - 2024-09-17

UI/UX:

- Added user highlight to input fields

Optimizations:

- Reran service worker script to update cache

Update:

- Update packages

Documentation:

- Updated README and code styling

Bug fix:

- Fixed canonical check compatibility with older JavaScript versions
- Fixed inconsistent width of landing content
- Fixed missing screenshots form factor prevent rich PWA install on desktop
- Fixed mobile responsiveness of landing page

## [1.3.3] - 2024-01-30

Optimizations:

- Reduce size of images

Update:

- Update packages

Documentation:

- Updated public facing email

Bug fix:

- Fixed content body image by replacing it with a CSS box-shadow
- Fixed responsive UI not working

## [1.3.2] - 2024-01-04

Update:

- Updated Sentry packages

## [1.3.1] - 2023-08-03

No longer supports Internet Explorer.

Optimizations:

- Optimized images
- Updated web manifest

Update:

- Updated OSSAR workflow

Bug fixes:

- Fix calling article data before getting article data
- Fix carousel trying to update before getting data
- Fixed "Duplicate without user-selected canonical"
- Fixed CaptureConsole not found and unable to call CaptureConsole
- Fixed Sentry tracking error
- Fixed Syntax Error ? unexpected token
- Fixed carousel not working
- Fixed domain issues
- Fixed missing HOYO article
- Fixed missing bootstrap files

## [1.3.0] - 2022-11-03

A brand new version of the [Small Dev Talk](https://smalldevtalk.net/) has dropped!

Version 1.3.0 mostly includes bug fixes and optimizations

Security:

- Added Content Security Policy
- Added Strict-Transport-Security

Optimizations:

- Added CI/CDs and GitHub Actions
- Added Sentry
- Added high fetch priority to LCP image
- Added more accessibility support
- Added sitemap
- Lazy loaded images
- Optimized images and SVGs
- Preload styles
- Removed \*{} from CSS
- Removed depreciated code
- Resoc images now load dynamically
- Update IE cache control
- Updated Google Analytics to GA4
- Updated favicons
- Updated metadata and SEO optimizations

Update:

- Update packages
- Update service workers scripts

Documentation:

- Prettified code and improved readability
- Sorted uncategorized CSS styles
- Updated README
- Updated prettier to ignore line endings

Bug fix:

- Fixed articles missing thumbnails and summaries
- Fixed issue with background gradient colour
- Fixed issue with bad-precaching-response
- Fixed issues with manifest having missing ID and orientation as well as incorrect start URL
- Fixed title image having random white line going through it

## [1.2.0] - 2021-11-18

A brand new version of the [Small Dev Talk](https://smalldevtalk.net/) has dropped!

Version 1.2 mostly includes bug fixes and optimizations

New feature:

- Added an archive page that lists all articles that Small Dev Talk ever written
- Add offline/caching service worker for instance if a user loses connection mid-usage
- Updated Google Analytics tracking options and added Google Tag Manager for bug tracking

Update:

- Updated packages including Bootstrap, showdown and jQuery

Optimization:

- Optimized images
- Added Clourflare meta data
- Added code scanners
- Address security concerns about possible client-side cross-site scripting vulnerabilities
- Added missing metadata
- Added lazy loading support
- Converted some images to SVGs

Documentation:

- Updated my author details to include personal website

Bug fix:

- Added space before 'Read More'
- Fixed issue where if an unknown page was loaded, it would just crash
- Fixed issue where was not able to retrieve Gloria Victis, Prisonhood, BlackSoul and DreadOut
- Fixed issue with service worker
- Fixed README having wrong link to Small Dev Talk's website

## [1.1.0] - 2019-06-14

All articles posted onto Small Dev Talk have now been fully archived including all uploaded videos by Small Dev Talk. Read the README for more instructions and updates.

Visit https://asully.github.io/Small-Dev-Talk/ to view Small Dev Talk's articles

## [1.0.0] - 2018-08-23

This is the release of the code that was used in the Small Dev Talk's website between March 2013 and April 2016. You can visit the website for Small Dev Talk at http://smalldevtalk.net (or http://smalldevtalk.tumblr.com if that link no longer works).

We wish the best of luck to all those were involved in Small Dev Talk (Alexander Sullivan, Neil Rampone and Jeff Cen) and all those we had the pleasure of talking with during Small Dev Talk's active period. And most importantly, thank you to all of our readers who visited Small Dev Talk!
