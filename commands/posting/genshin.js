const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, AttachmentBuilder, ButtonStyle } = require('discord.js');

const Canvas = require('@napi-rs/canvas');
const path = require('node:path');
const resPath = path.join(__dirname, 'genshin');
Canvas.GlobalFonts.registerFromPath(path.join(resPath, 'zh-cn.ttf'), 'genshin');
const res = { width: 700, height: 300 };

const applyText = (canvas, text, size, maxWidth, family) => {
	const context = canvas.getContext('2d');
	let fontSize = size;
	context.font = `${size}px ${family}`;
	while (context.measureText(text).width > maxWidth) {
		context.font = `${fontSize -= 1}px ${family}`;
	}
	return context.font;
};

module.exports = {
	data: new SlashCommandBuilder()
		.setDMPermission(false)
		.setDefaultMemberPermissions('0')
		.setName('genshin')
		.setDescription('Post Genshin Impact promocode')
		.setDescriptionLocalizations({ ru: 'Опубликовать промокод Genshin Impact' })
		.addStringOption(option =>
			option
				.setName('code')
				.setNameLocalizations({ ru: 'код' })
				.setDescription('Enter promocode')
				.setDescriptionLocalizations({ ru:'Введите промокод' })
				.setRequired(true))
		.addIntegerOption(option =>
			option
				.setName('gems')
				.setNameLocalizations({ ru: 'гемы' })
				.setDescription('Enter the amount of Primogems if code provides any')
				.setDescriptionLocalizations({ ru: 'Введите количество Камней Истока при их наличии' })
				.setMinValue(1)
				.setMaxValue(9999999))
		.addIntegerOption(option =>
			option
				.setName('mora')
				.setNameLocalizations({ ru: 'мора' })
				.setDescription('Enter the amount of Mora if code provides any')
				.setDescriptionLocalizations({ ru: 'Введите количество Моры при её наличии' })
				.setMinValue(1)
				.setMaxValue(9999999))
		.addIntegerOption(option =>
			option
				.setName('exp-purple')
				.setNameLocalizations({ ru: 'опыт-фиол' })
				.setDescription('Enter the amount of Hero\'s Wit if code provides any')
				.setDescriptionLocalizations({ ru: 'Введите количество Опыта Героя при его наличии' })
				.setMinValue(1)
				.setMaxValue(9999999))
		.addIntegerOption(option =>
			option
				.setName('exp-blue')
				.setNameLocalizations({ ru: 'опыт-син' })
				.setDescription('Enter the amount of Adventurer\'s Experience if code provides any')
				.setDescriptionLocalizations({ ru: 'Введите количество Опыта Искателя Приключений при его наличии' })
				.setMinValue(1)
				.setMaxValue(9999999))
		.addIntegerOption(option =>
			option
				.setName('ore-blue')
				.setNameLocalizations({ ru: 'руда-син' })
				.setDescription('Enter the amount of Mystic Enhancement Ore if code provides any')
				.setDescriptionLocalizations({ ru: 'Введите количество Волшебной Руды Усиления при её наличии' })
				.setMinValue(1)
				.setMaxValue(9999999))
		.addIntegerOption(option =>
			option
				.setName('ore-green')
				.setNameLocalizations({ ru: 'руда-зел' })
				.setDescription('Enter the amount of Fine Enhancement Ore if code provides any')
				.setDescriptionLocalizations({ ru: 'Введите количество Превосходной Руды Усиления при её наличии' })
				.setMinValue(1)
				.setMaxValue(9999999))
		.addStringOption(option =>
			option
				.setName('notes')
				.setNameLocalizations({ ru: 'примечание' })
				.setDescription('Make a note about any additions')
				.setDescriptionLocalizations({ ru: 'Вы можете оставить примечание (например, есть ли в коде еда)' })
				.setMinLength(2)
				.setMaxLength(40))
		.addStringOption(option =>
			option
				.setName('language')
				.setNameLocalizations({ ru: 'язык' })
				.setDescription('Choose post language')
				.setDescriptionLocalizations({ ru: 'Выберите язык публикации' })
				.addChoices(
					{ name: 'EN', value: 'en' },
					{ name: 'RU', value: 'ru' },
				))
		/* .addRoleOption(option =>
			option
				.setName('role')
				.setNameLocalizations({ ru: 'роль' })
				.setDescription('Choose role to ping')
				.setDescriptionLocalizations({ ru: 'Выберите роль для упоминания' })) */,
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		// getting values
		const code = interaction.options.getString('code').toUpperCase();
		const gems = interaction.options.getInteger('gems');
		const mora = interaction.options.getInteger('mora');
		const exp_p = interaction.options.getInteger('exp-purple');
		const exp_b = interaction.options.getInteger('exp-blue');
		const ore_b = interaction.options.getInteger('ore-blue');
		const ore_g = interaction.options.getInteger('ore-green');
		const language = interaction.options.getString('language');
		// const role = interaction.options.getRole('role');
		const food = interaction.options.getString('notes');
		// checking fields
		if (!(gems || mora || exp_b || exp_p || ore_b || ore_g)) {
			switch (interaction.locale) {
			case 'ru':
				return interaction.editReply({ content: 'Введите хотя бы один параметр, кроме кода, прочего и языка.', ephemeral: true });
			default:
				return interaction.editReply({ content: 'Enter at least 1 parameter except code, notes and laguage.', ephemeral: true });
			}
		}
		if ((exp_b && exp_p) || (ore_b && ore_g)) {
			switch (interaction.locale) {
			case 'ru':
				return interaction.editReply({ content: 'Одновременно не может быть два типа опыта или руды.', ephemeral: true });
			default:
				return interaction.editReply({ content: 'You can\'t enter different types of exp or ore at the same time.', ephemeral: true });
			}
		}
		// let's start drawing
		// draw bg and frame
		const canvas = Canvas.createCanvas(res.width, res.height);
		const context = canvas.getContext('2d');
		const bg = await Canvas.loadImage(`${__dirname}/genshin/bg1.png`);
		context.drawImage(bg, 0, 0, canvas.width, canvas.height);
		const frame = await Canvas.loadImage(`${__dirname}/genshin/frame.png`);
		context.drawImage(frame, 0, 0, canvas.width, canvas.height);
		// let's draw title, code and food if we have
		context.fillStyle = '#FFFFFF';
		// draw title
		let title;
		switch (language) {
		case 'ru':
			title = 'Новый промокод!';
			break;
		default:
			title = 'New redemption code!';
		}
		context.font = '30px genshin';
		context.fillText(title, (canvas.width - context.measureText(title).width) / 2, 46);
		// draw code
		context.font = applyText(canvas, code, 70, 680, 'genshin');
		context.fillText(code, (canvas.width - context.measureText(code).width) / 2, 133);
		// draw food if we have (change text for reward values anyways)
		context.font = '18px genshin';
		if (food) {
			context.fillText('* ' + food, 5, 287);
		}
		// drawing reward cells
		// prepare cells
		const cells = [];
		if (gems) { cells.push({ image: 'gem.png', value: `${gems}` }); }
		if (mora) { cells.push({ image: 'mora.png', value: `${mora}` }); }
		if (exp_p) { cells.push({ image: 'exp-purple.png', value: `${exp_p}` }); }
		if (exp_b) { cells.push({ image: 'exp-blue.png', value: `${exp_b}` }); }
		if (ore_b) { cells.push({ image: 'ore-blue.png', value: `${ore_b}` }); }
		if (ore_g) { cells.push({ image: 'ore-green.png', value: `${ore_g}` }); }
		const cellSize = 100;
		const start_x = (canvas.width - cells.length * cellSize) / 2;
		// draw cells
		let shift = 0;
		for (const cell of cells) {
			const image = await Canvas.loadImage(`${__dirname}/genshin/${cell.image}`);
			context.drawImage(image, start_x + shift, 155, cellSize, cellSize);
			context.fillText(cell.value, start_x + shift + (cellSize - context.measureText(cell.value).width) / 2, 255);
			shift += cellSize;
		}
		// building an attachment
		const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: `${code}.png` });
		// creating link button
		let webLabel;
		let url;
		switch (language) {
		case 'ru':
			webLabel = 'Ввести код на сайте';
			url = `https://genshin.hoyoverse.com/ru/gift?code=${code}`;
			break;
		default:
			webLabel = 'Redeem code on the website';
			url = `https://genshin.hoyoverse.com/en/gift?code=${code}`;
		}
		const linkButton = new ButtonBuilder()
			.setLabel(webLabel)
			.setURL(url)
			.setStyle(ButtonStyle.Link);
		// creating code message button
		/* let codeLabel;
		const customId = `etocode${code}`;
		switch (language) {
		case 'ru':
			codeLabel = 'Получить код!';
			break;
		default:
			codeLabel = 'Get the code!';
		}
		const codeButton = new ButtonBuilder()
			.setLabel(codeLabel)
			.setCustomId(customId)
			.setStyle(ButtonStyle.Primary); */
		// adding to the row
		const row = new ActionRowBuilder().addComponents(linkButton);
		await interaction.channel.send({ content: `${code}`, files: [attachment], components: [row] });
		const success = { ru: 'Успех!' };
		return interaction.editReply(success[interaction.locale] ?? 'Success!');
	},

};