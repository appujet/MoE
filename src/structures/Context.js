const {
	Message,
	CommandInteraction,
	EmbedBuilder,
	ChatInputCommandInteraction,
	BaseInteraction,
	User,
	BaseChannel,
	Guild,
	GuildMember,
	Collection
} = require('discord.js');
const Moe = require('./Client');

module.exports = class Context {

	constructor(ctx, args) {
		/**
     * @type {?boolean}
     */
		this.isInteraction =
      ctx instanceof CommandInteraction ||
      ctx instanceof ChatInputCommandInteraction ||
      ctx instanceof BaseInteraction;
		/**
     * @type {import("discord.js").Interaction}
     */
		this.ctx = ctx;
		/**
     * @type {void}
     */
		this.setArgs(args);
		/**
     * @type {?import("discord.js").Interaction}
     */
		this.interaction = this.isInteraction ? ctx : null;
		/**
     * @type {?import("discord.js").Message}
     */
		this.message = this.isInteraction ? null : ctx;
		/**
     * @type {?string}
     */
		this.id = ctx.id;
		/**
     * @type {?string}
     */
		this.applicationId = ctx.applicationId;
		/**
     * @type {?string}
     */
		this.channelId = ctx.channelId;
		/**
     * @type {?string}
     */
		this.guildId = ctx.guildId;
		/**
     * @type {Moe}
     */
		this.client = ctx.client;
		/**
     * @type {User}
     */
		this.author = ctx instanceof Message ? ctx.author : ctx.user;
		/**
     * @type {BaseChannel}
     */
		this.channel = ctx.channel;
		/**
     * @type {Guild}
     */
		this.guild = ctx.guild;
		/**
     * @type {GuildMember}
     */
		this.member = ctx.member;
		/**
     * @type {?Date}
     */
		this.createdAt = ctx.createdAt;
		/**
     * @type {number}
     */
		this.createdTimestamp = ctx.createdTimestamp;
		/**
     * @type {Collection<?string, import("discord.js").AttachmentData>}
     */
		this.attachments = ctx.attachments;
	}

	/**
   *
   * @param {any} args
   * @returns {void}
   */
	setArgs(args) {
		if (this.isInteraction) {
			this.args = args.map((arg) => arg.value);
		} else {
			this.args = args;
		}
	}

	/**
   *
   * @param {string} content
   * @returns {Promise<Message>}
   */
	async sendMessage(content) {
		if (this.isInteraction) {
			this.msg = this.interaction.deferred ?
				await this.interaction.followUp(content) :
				await this.interaction.reply(content);
			return this.msg;
		} else {
			this.msg = this.message.channel.send(content);
			return this.msg;
		}
	}

	/**
   *
   * @param {string} content
   * @returns {Promise<Message>}
   */
	async sendDeferMessage(content) {
		if (this.isInteraction) {
			this.msg = await this.interaction.deferReply({ fetchReply: true });
			return this.msg;
		} else {
			this.msg = await this.channel.send(content);
			return this.msg;
		}
	}

	/**
   *
   * @param {string} content
   * @returns {Promise<Message>}
   */
	async sendFollowUp(content) {
		if (this.isInteraction) {
			await this.interaction.followUp(content);
		} else {
			this.channel.send(content);
		}
	}

	/**
   *
   * @param {string} content
   * @returns {Promise<Message>}
   */
	async editMessage(content) {
		if (this.isInteraction) {
			return await this.interaction.editReply(content);
		} else {
			return await this.msg.edit(content);
		}
	}

	/**
   * @returns {Promise<Message>}
   */
	async deleteMessage() {
		if (this.isInteraction) {
			return await this.interaction.deleteReply();
		} else {
			return await this.msg.delete();
		}
	}

	/**
   *
   * @param {string} commandName
   * @param {Message} message
   * @param {any} args
   * @param {Moe} client
   * @returns {void}
   */
	async invalidArgs(commandName, message, args, client) {
		try {
			const color = client.config.color ? client.config.color : '#59D893';
			const { prefix } = client.config;
			const command =
        client.commands.get(commandName) ||
        client.commands.get(client.aliases.get(commandName));
			if (!command) {
				return await message
					.edit({
						embeds: [new EmbedBuilder().setColor(color).setDescription(args)],
						allowedMentions: {
							repliedUser: false
						}
					})
					.catch(() => {});
			}
			const embed = new EmbedBuilder()
				.setColor(color)
				.setAuthor({
					name: message.author.tag.toString(),
					iconURL: message.author
						.displayAvatarURL({ dynamic: true })
						.toString()
				})
				.setDescription(`**${args}**`)
				.setTitle(`__${command.name}__`)
				.addFields([
					{
						name: 'Usage',
						value: `\`${
							command.description.usage ?
								`${prefix}${command.name} ${command.description.usage}` :
								`${prefix}${command.name}`
						}\``,
						inline: false
					},
					{
						name: 'Example(s)',
						value: `${
							command.description.examples ?
								`\`${prefix}${command.description.examples.join(
									`\`\n\`${prefix}`
								)}\`` :
								`\`${prefix}${command.name}\``
						}`
					}
				]);

			await this.msg.edit({
				content: null,
				embeds: [embed],
				allowedMentions: { repliedUser: false }
			});
		} catch (e) {
			console.error(e);
		}
	}

};
