const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, AttachmentBuilder, ButtonStyle } = require('discord.js');

const Canvas = require('@napi-rs/canvas');
const path = require('node:path');
const resPath = path.join(__dirname, 'hsr');
Canvas.GlobalFonts.registerFromPath(path.join(resPath, 'zekton_rg.otf'), 'hsr');
Canvas.GlobalFonts.registerFromPath(path.join(resPath, 'GT_Grotesk.otf'), 'hsr-code');
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
		.setName('hsr')
		.setDescription('Post Honkai: Star Rail promocode')
		.setDescriptionLocalizations({ ru: 'Опубликовать промокод Honkai: Star Rail' })
		.addStringOption(option =>
			option
				.setName('code')
				.setNameLocalizations({ ru: 'код' })
				.setDescription('Enter promocode')
				.setDescriptionLocalizations({ ru:'Введите промокод' })
				.setRequired(true))
		.addIntegerOption(option =>
			option
				.setName('jades')
				.setNameLocalizations({ ru: 'нефрит' })
				.setDescription('Enter the amount of Stellar Jades if code provides any')
				.setDescriptionLocalizations({ ru: 'Введите количество Звёздного нефрита при его наличии' })
				.setMinValue(1)
				.setMaxValue(9999999))
		.addIntegerOption(option =>
			option
				.setName('credits')
				.setNameLocalizations({ ru: 'кредиты' })
				.setDescription('Enter the amount of Crdits if code provides any')
				.setDescriptionLocalizations({ ru: 'Введите количество Кредитов при их наличии' })
				.setMinValue(1)
				.setMaxValue(9999999))
		.addIntegerOption(option =>
			option
				.setName('exp-purple')
				.setNameLocalizations({ ru: 'опыт-фиол' })
				.setDescription('Enter the amount of Traveler\'s Guides if code provides any')
				.setDescriptionLocalizations({ ru: 'Введите количество Путеводителей Путешественника при их наличии' })
				.setMinValue(1)
				.setMaxValue(9999999))
		.addIntegerOption(option =>
			option
				.setName('exp-blue')
				.setNameLocalizations({ ru: 'опыт-син' })
				.setDescription('Enter the amount of Adventure Logs if code provides any')
				.setDescriptionLocalizations({ ru: 'Введите количество Журналов Приключений при их наличии' })
				.setMinValue(1)
				.setMaxValue(9999999))
		.addIntegerOption(option =>
			option
				.setName('aether-purple')
				.setNameLocalizations({ ru: 'эфир-фиол' })
				.setDescription('Enter the amount of Refined Aether if code provides any')
				.setDescriptionLocalizations({ ru: 'Введите количество Очищенного Эфира при его наличии' })
				.setMinValue(1)
				.setMaxValue(9999999))
		.addIntegerOption(option =>
			option
				.setName('aether-blue')
				.setNameLocalizations({ ru: 'эфир-син' })
				.setDescription('Enter the amount of Condensed Aether if code provides any')
				.setDescriptionLocalizations({ ru: 'Введите количество Конденсированного Эфира при его наличии' })
				.setMinValue(1)
				.setMaxValue(9999999))
		.addStringOption(option =>
			option
				.setName('notes')
				.setNameLocalizations({ ru: 'примечание' })
				.setDescription('Make a note about any additions')
				.setDescriptionLocalizations({ ru: 'Вы можете оставить примечание (например, есть ли в коде расходки)' })
				.setMinLength(2)
				.setMaxLength(55))
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
		const jades = interaction.options.getInteger('jades');
		const credits = interaction.options.getInteger('credits');
		const exp_p = interaction.options.getInteger('exp-purple');
		const exp_b = interaction.options.getInteger('exp-blue');
		const aether_p = interaction.options.getInteger('aether-purple');
		const aether_b = interaction.options.getInteger('aether-blue');
		const language = interaction.options.getString('language');
		// const role = interaction.options.getRole('role');
		const other = interaction.options.getString('notes');
		// checking fields
		if (!(jades || credits || exp_b || exp_p || aether_p || aether_b)) {
			switch (interaction.locale) {
			case 'ru':
				return interaction.editReply({ content: 'Введите хотя бы один параметр, кроме кода, примечания и языка.', ephemeral: true });
			default:
				return interaction.editReply({ content: 'Enter at least 1 parameter except code, notes and laguage.', ephemeral: true });
			}
		}
		if ((exp_b && exp_p) || (aether_p && aether_b)) {
			switch (interaction.locale) {
			case 'ru':
				return interaction.editReply({ content: 'Одновременно не может быть два типа опыта или эфира.', ephemeral: true });
			default:
				return interaction.editReply({ content: 'You can\'t enter different types of exp or aether at the same time.', ephemeral: true });
			}
		}
		// let's start drawing
		// draw bg and frame
		const canvas = Canvas.createCanvas(res.width, res.height);
		const context = canvas.getContext('2d');
		const bg = await Canvas.loadImage(`${__dirname}/hsr/bg1.png`);
		context.drawImage(bg, 0, 0, canvas.width, canvas.height);
		const frame = await Canvas.loadImage(`${__dirname}/hsr/frame.png`);
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
		context.font = '33px hsr';
		context.fillText(title, (canvas.width - context.measureText(title).width) / 2, 46);
		// draw code
		context.fillStyle = '#ffeac8';
		context.font = applyText(canvas, code, 70, 680, 'hsr-code');
		context.fillText(code, (canvas.width - context.measureText(code).width) / 2, 136);
		// draw food if we have (change text for reward values anyways)
		context.fillStyle = '#FFFFFF';
		context.font = '18px hsr';
		if (other) {
			context.fillText('* ' + other, 5, 291);
		}
		// drawing reward cells
		// prepare cells
		const cells = [];
		if (jades) { cells.push({ image: 'jade.png', value: `${jades}` }); }
		if (credits) { cells.push({ image: 'credits.png', value: `${credits}` }); }
		if (exp_p) { cells.push({ image: 'exp-good.png', value: `${exp_p}` }); }
		if (exp_b) { cells.push({ image: 'exp-ok.png', value: `${exp_b}` }); }
		if (aether_p) { cells.push({ image: 'aether-good.png', value: `${aether_p}` }); }
		if (aether_b) { cells.push({ image: 'aether-ok.png', value: `${aether_b}` }); }
		const cellSize = 100;
		const start_x = (canvas.width - cells.length * cellSize) / 2;
		// draw cells
		let shift = 0;
		for (const cell of cells) {
			const image = await Canvas.loadImage(`${__dirname}/hsr/${cell.image}`);
			context.drawImage(image, start_x + shift, 159, cellSize, cellSize);
			context.fillText(cell.value, start_x + shift + (cellSize - context.measureText(cell.value).width) / 2, 259);
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
			url = 'https://hsr.hoyoverse.com/gift';
			break;
		default:
			webLabel = 'Redeem code on the website';
			url = 'https://hsr.hoyoverse.com/gift';
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