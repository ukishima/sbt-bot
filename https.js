const express = require("express");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const settings = require("./settings.json");
const sbtImage = require("./sbt-image/sbtImage.js");
const fs = require("fs");

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

const app = express();

const server = app.listen(8080, function() {
	console.log(`Node.js is listening to PORT:${server.address().port}`);
});

app.get("/list", function(req, res, next) {
	const list = require("./requests");
	const result = {};

	if (list[req.query.userid]) {
		result.userid = req.query.userid;
		result.username = list[req.query.userid].username;
		result.address = list[req.query.userid].address;
		result.image = list[req.query.userid].image;
	}
	res.json(result);
});

app.get("/image", async (req, res, next) => {
	let pngData;
	if (fs.existsSync(`./sbt-image/png/${req.query.userid}.png`)) {
		pngData = fs.readFileSync(`./sbt-image/png/${req.query.userid}.png`);
	} else {
		const result = await getMember(req.query.userid);
		if (result) {
			pngData = await sbtImage.createSBTImage(
				req.query.userid,
				result.username,
				result.avatar,
			);
		} else {
			pngData = fs.readFileSync("./sbt-image/no-image.png");
			res.status(404);
		}
	}
	res.type("png");
	res.send(pngData);
});

const getMember = async (userid) => {
	try {
		const result = await rest.get(
			Routes.guildMember(settings.GUILD_ID, userid),
		);
		let icon;
		if (result.avatar) {
			icon = `https://cdn.discordapp.com/guilds/${settings.GUILD_ID}/users/${result
				.user.id}/avatars/${result.avatar}.png`;
		} else if (result.user.avatar) {
			icon = `https://cdn.discordapp.com/avatars/${result.user.id}/${result.user
				.avatar}.png`;
		} else {
			icon = "https://discord.com/assets/f9bb9c4af2b9c32a2c5ee0014661546d.png";
		}
		return { username: result.user.username, avatar: icon };
	} catch (e) {
		return null;
	}
};
