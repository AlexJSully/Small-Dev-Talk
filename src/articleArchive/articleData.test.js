const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..", "..");
const articleData = JSON.parse(fs.readFileSync(path.join(__dirname, "articleData.json"), "utf8"));
const articles = Object.entries(articleData);

/**
 * Return the folder of an article in the archive, which holds its markdown and images.
 * @param {string} key The key of the article in articleData.json.
 * @param {{author: string, date: string}} article The article's data from articleData.json.
 * @returns {string} The absolute path of the folder.
 */
function articleFolder(key, article) {
	return path.join(__dirname, `author${article.author.replace(/\s/g, "")}`, `${article.date}_${key}`);
}

/**
 * Read the size from the first chunk of a WebP file, in its lossy (VP8), lossless (VP8L) or extended (VP8X) format.
 * @param {Buffer} data The file contents.
 * @returns {{width: number, height: number}} The size in pixels.
 * @throws {Error} When the first chunk is none of those three.
 */
function webpSize(data) {
	const readers = {
		"VP8 ": () => ({ width: data.readUInt16LE(26) & 0x3fff, height: data.readUInt16LE(28) & 0x3fff }),
		VP8L: () => {
			const bits = data.readUInt32LE(21);

			return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
		},
		VP8X: () => ({ width: data.readUIntLE(24, 3) + 1, height: data.readUIntLE(27, 3) + 1 }),
	};
	const chunk = data.toString("ascii", 12, 16);

	if (!Object.hasOwn(readers, chunk)) {
		throw new Error(`Unsupported WebP chunk "${chunk}"`);
	}

	return readers[chunk]();
}

/**
 * Read the orientation tag of the EXIF segment that starts at `offset` in a JPEG file.
 * @param {Buffer} data The file contents.
 * @param {number} offset Where the APP1 segment holding the EXIF data starts.
 * @returns {number} The EXIF orientation, 1 to 8, or 1 when the segment has none.
 */
function exifOrientation(data, offset) {
	const tiff = offset + 10;
	const little = data.toString("ascii", tiff, tiff + 2) === "II";
	const read16 = (at) => (little ? data.readUInt16LE(at) : data.readUInt16BE(at));
	const read32 = (at) => (little ? data.readUInt32LE(at) : data.readUInt32BE(at));
	const directory = tiff + read32(tiff + 4);
	const entries = Array.from({ length: read16(directory) }, (_, entry) => directory + 2 + entry * 12);
	const orientationEntry = entries.find((at) => read16(at) === 0x0112);

	return orientationEntry === undefined ? 1 : read16(orientationEntry + 8);
}

/**
 * Read the size from the frame header of a JPEG file. A JPEG whose EXIF orientation turns it a quarter turn (5 to 8)
 * reports its sides swapped, because browsers apply that orientation.
 * @param {Buffer} data The file contents.
 * @returns {{width: number, height: number}} The displayed size in pixels.
 */
function jpegSize(data) {
	let offset = 2;
	let orientation = 1;

	while (offset < data.length) {
		const marker = data[offset + 1];

		if (marker === 0xe1 && data.toString("ascii", offset + 4, offset + 8) === "Exif") {
			orientation = exifOrientation(data, offset);
		}

		// SOF0 to SOF15 carry the frame size, except DHT (C4), JPG (C8) and DAC (CC).
		if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
			const height = data.readUInt16BE(offset + 5);
			const width = data.readUInt16BE(offset + 7);

			return orientation >= 5 ? { width: height, height: width } : { width, height };
		}

		offset += 2 + data.readUInt16BE(offset + 2);
	}

	throw new Error("JPEG has no frame header");
}

/** Each supported image format: how to recognize its file, and how to read its size. */
const IMAGE_FORMATS = [
	{
		matches: (data) => data.toString("ascii", 1, 4) === "PNG",
		size: (data) => ({ width: data.readUInt32BE(16), height: data.readUInt32BE(20) }),
	},
	{
		matches: (data) => data.toString("ascii", 0, 3) === "GIF",
		size: (data) => ({ width: data.readUInt16LE(6), height: data.readUInt16LE(8) }),
	},
	{
		matches: (data) => data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP",
		size: webpSize,
	},
	{ matches: (data) => data[0] === 0xff && data[1] === 0xd8, size: jpegSize },
];

/**
 * Read the displayed width and height of a PNG, GIF, JPEG or WebP file from its header.
 * @param {Buffer} data The file contents.
 * @returns {{width: number, height: number}} The size in pixels.
 */
function imageSize(data) {
	const format = IMAGE_FORMATS.find(({ matches }) => matches(data));

	if (!format) {
		throw new Error("Unsupported image format");
	}

	return format.size(data);
}

describe("articleData.json", () => {
	const withThumbnail = articles.filter(([, article]) => article.thumbnail);

	test.each(withThumbnail)("%s has a thumbnail file in its article folder", (key, article) => {
		expect(fs.existsSync(path.join(articleFolder(key, article), article.thumbnail))).toBe(true);
	});

	test.each(withThumbnail)("%s has the width and height of its thumbnail file", (key, article) => {
		const thumbnail = fs.readFileSync(path.join(articleFolder(key, article), article.thumbnail));

		expect(imageSize(thumbnail)).toEqual({ width: article.thumbnailWidth, height: article.thumbnailHeight });
	});
});

describe("article markdown", () => {
	/** Each article's markdown, or null when its file is missing, so that one article fails by name. */
	const markdown = new Map(
		articles.map(([key, article]) => {
			const file = path.join(articleFolder(key, article), `${key}.md`);

			return [key, fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null];
		}),
	);
	const images = Array.from(markdown, ([key, text]) =>
		Array.from((text ?? "").matchAll(/!\[[^\]]*\]\(([^)]+)\)/g), ([, target]) => [key, target]),
	).flat();

	test.each(articles.map(([key]) => key))("%s has article content", (key) => {
		expect(markdown.get(key)?.trim().length).toBeGreaterThan(0);
	});

	test.each(images)("%s gives the size of %s", (key, target) => {
		expect(target).toMatch(/^\S+ =[1-9]\d*x[1-9]\d*$/);
	});

	test.each(images.filter(([, target]) => target.startsWith("src")))(
		"%s image %s exists and is the size the markdown gives",
		(key, target) => {
			const [, url, width, height] = target.match(/^(\S+) =(\d+)x(\d+)$/);
			const file = path.join(root, ...url.split("\\"));

			expect(fs.existsSync(file)).toBe(true);
			expect(imageSize(fs.readFileSync(file))).toEqual({ width: Number(width), height: Number(height) });
		},
	);

	test.each(images.filter(([, target]) => !target.startsWith("src")))(
		"%s links only YouTube thumbnails from other sites, which are 480 by 360: %s",
		(key, target) => {
			expect(target).toMatch(/^https:\/\/img\.youtube\.com\/vi\/[\w-]+\/0\.jpg =480x360$/);
		},
	);
});
