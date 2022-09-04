const fs = require("fs");
const fetch = require("node-fetch");
const { Resvg } = require("@resvg/resvg-js");

const createSBTImage = async (userid, username, icon) => {
	const base = fs.readFileSync("./sbt-image/base.svg", "utf8");
	let svg = base.replace("$username$", username);

	svg = svg.replace("$icon$", icon);
	//fs.writeFileSync(`./sbt-image/svg/${userid}.svg` , svg);

	const opts = {
		font: {
			fontFiles: ["./sbt-image/ConcertOne.ttf", "./sbt-image/KosugiMaru.ttf"],
			loadSystemFonts: false,
			defaultFontFamily: 'Concert One, Kosugi Maru',
		}
	};
	const resvg = new Resvg(svg, opts);

	const resolved = await Promise.all(
		resvg.imagesToResolve().map(async (url) => {
			const img = await fetch(url);
			const buffer = await img.arrayBuffer();
			return {
				url,
				buffer: Buffer.from(buffer),
			};
		}),
	);

	if (resolved.length > 0) {
		for (const result of resolved) {
			const { url, buffer } = result;
			resvg.resolveImage(url, buffer);
		}
	}

	const pngData = resvg.render();
	const pngBuffer = pngData.asPng();

	//fs.writeFileSync(`./sbt-image/png/${userid}.png`, pngBuffer);
	//console.log(`created ${userid}.png`);
	return pngBuffer;
};

module.exports = { createSBTImage };