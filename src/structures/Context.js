const { Message, CommandInteraction, EmbedBuilder, User, BaseChannel, Guild, GuildMember, Interaction } = require('discord.js');
module.exports = class Context {
    constructor(ctx, args) {
        /**
         * @type {boolean}
         */
        this.isInteraction = ctx instanceof CommandInteraction;
        /**
         * @type {Message | CommandInteraction}
         */
        this.ctx = ctx;
        /**
         * @type {void}
         */
        this.setArgs(args);
        /**
         * @type {Interaction}
         */
        this.interaction = this.isInteraction ? ctx : null;
        /**
         * @type {Message}
         */
        this.message = this.isInteraction ? null : ctx;
        /**
         * @type {String}
         */
        this.id = ctx.id;
        /**
        * @type {String}
        */
        this.applicationId = ctx.applicationId;
        /**
        * @type {String}
        */
        this.channelId = ctx.channelId;
        /**
        * @type {String}
        */
        this.guildId = ctx.guildId;
        /**
        * @type {import('@structures/Client')}
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
         * @type {Date}
         */
        this.createdAt = ctx.createdAt;
        /**
         * @type {Number}
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
            this.args = args.map(arg => arg.value);
        }
        else {
            this.args = args;
        }
    };
    /**
     * 
     * @param {String} content 
     * @returns {Promise<Message>}
     */
    async sendMessage(content) {
        if (this.isInteraction) {
            this.msg = this.interaction.deferred ? await this.followUp(content) : await this.reply(content);
            return this.msg;
        } else {
            this.msg = this.message.channel.send(content);
            return this.msg;
        }
    };
    /**
     * 
     * @param {String} content 
     * @returns {Promise<Message>}
     */
    async sendDeferMessage(content) {
        if (this.isInteraction) {
            this.msg = await this.interaction.deferReply({ fetchReply: true });
            return this.msg;
        }
        else {
            this.msg = await this.message.channel.send(content);
            return this.msg;
        }
    };
    /**
     * 
     * @param {String} content 
     * @returns {Promise<Message>}
     */
    async sendFollowUp(content) {
        if (this.isInteraction) {
            await this.followUp(content);
        }
        else {
            this.channel.send(content);
        }
    };
    /**
     * 
     * @param {String} content 
     * @returns {Promise<Message>}
     */
    async editMessage(content) {
        if (this.isInteraction) {
            return this.interaction.editReply(content);
        }
        else {
            return this.msg.edit(content);
        }
    };
    /**
     * 
     * @returns {Promise<Message>}
     */
    deleteMessage() {
        if (this.isInteraction) {
            return this.interaction.deleteReply();
        }
        else {
            return this.msg.delete();
        }
    };

    /**
     * @param {string} commandName
     * @param {Message} message
     * @param {string[]} args
     * @param {import('@structures/Client')} client
     * @returns {Promise<void>}
     */
    async invalidArgs(commandName, message, args, client) {
        try {
            let color = client.config.color ? client.config.color : "#59D893";
            let prefix = client.config.prefix;
            let command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));
            if (!command) return await message.edit({
                embeds: [new EmbedBuilder().setColor(color).setDescription(args)], allowedMentions: {
                    repliedUser: false
                }
            }).catch(() => { });
            let embed = new EmbedBuilder()
                .setColor(color)
                .setAuthor({ name: message.author.tag.toString(), iconURL: message.author.displayAvatarURL({ dynamic: true }).toString() })
                .setDescription(`**${args}**`)
                .setTitle(`__${command.name}__`)
                .addFields([
                    {
                        name: "Usage",
                        value: `\`${command.description.usage ? `${prefix}${command.name} ${command.description.usage}` : `${prefix}${command.name}`}\``,
                        inline: false
                    }, {
                        name: "Example(s)",
                        value: `${command.description.examples ? `\`${prefix}${command.description.examples.join(`\`\n\`${prefix}`)}\`` : "`" + prefix + command.name + "`"}`
                    }
                ]);

            await this.msg.edit({
                content: null,
                embeds: [embed],
                allowedMentions: { repliedUser: false }
            });
        } catch (e) {
            console.error(e);
        };
    };

};