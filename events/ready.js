const { Events, ActivityType } = require('discord.js');
require('dotenv/config');

let status = [
	{
		type: ActivityType.Playing,
		name: 'Genshin Impact',
	},
	{
		type: ActivityType.Playing,
		name: 'Honkai: Star Rail',
	},
];

module.exports = {
	name: Events.ClientReady,
	once: false,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		setInterval(() => {
			let random = Math.floor(Math.random() * status.length);
			client.user.setActivity(status[random]);
			// console.log(`${status.at(random).name}`);
		}, 30_000);
	},
};