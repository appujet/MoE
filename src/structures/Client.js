const { Client, Routes, REST, ActionRowBuilder, PermissionsBitField, ApplicationCommandType, GatewayIntentBits, Partials, Collection, EmbedBuilder, ButtonBuilder, SelectMenuBuilder } = require("discord.js");
const { connect } = require("mongoose");
const { readdirSync } = require('node:fs');
const Logger = require('@structures/Logger');
const Cluster = require('discord-hybrid-sharding');
const Manager = require('@structures/Manager');

module.exports = class Moe extends Client {
    constructor() {
        super({
            allowedMentions: {
                parse: ["users", "roles", "everyone"],
                repliedUser: false,
            },
            shards: Cluster.data.SHARD_LIST,
            shardCount: Cluster.data.TOTAL_SHARDS,
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildInvites,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMessageTyping,
                GatewayIntentBits.GuildBans,
                GatewayIntentBits.GuildWebhooks,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.GuildEmojisAndStickers,
            ],
            partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User, Partials.Reaction],
            restTimeOffset: 0,
        });
        this.commands = new Collection();
        this.config = require('@src/config');
        this.aliases = new Collection();
        this.contextMenus = new Collection();
        this.cooldowns = new Collection();
        this.cluster = new Cluster.Client(this);
        this.logger = new Logger({
            displayTimestamp: true,
            displayDate: true
        });
        this._connectMongodb();
        this.manager = new Manager(this);
    }
    /**
     * 
     * @returns {EmbedBuilder}
     */
    embed() {
        return new EmbedBuilder();
    };
    /**
     * 
     * @returns {ButtonBuilder}
     */
    button() {
        return new ButtonBuilder();
    };
    /**
     * 
     * @returns {SelectMenuBuilder}
     */
    manu() {
        return new SelectMenuBuilder();
    };
    /**\
     * 
     * @returns {ActionRowBuilder}
     */
    raw() {
        return new ActionRowBuilder();
    };

    loadCommands() {
        const data = [];
        let i = 0;
        const commandsFolder = readdirSync('./src/commands/');
        commandsFolder.forEach(category => {
            const categories = readdirSync(`./src/commands/${category}/`).filter(file => file.endsWith('.js'));
            categories.forEach(command => {
                const f = require(`../commands/${category}/${command}`);
                const cmd = new f(this, f);
                cmd.category = category;
                cmd.file = f;
                cmd.fileName = f.name;
                this.commands.set(cmd.name, cmd);
                if (cmd.aliases && Array.isArray(cmd.aliases)) {
                    for (const alias of cmd.aliases) {
                        this.aliases.set(alias, cmd);
                    }
                };
                if (cmd.slashCommand) {
                    data.push({
                        name: cmd.name,
                        description: cmd.description.content,
                        options: cmd.options,
                        type: ApplicationCommandType.ChatInput,
                    });
                    if (cmd.permissions.user.length > 0) data.default_member_permissions = cmd.permissions.user ? PermissionsBitField.resolve(cmd.permissions.user).toString() : 0;
                    ++i
                };
                this.logger.event(`Successfully loaded [/] command ${i}.`)

                const rest = new REST({ version: '9' }).setToken(this ? this.config.token : config.token);

                rest.put(Routes.applicationCommands(this ? this.config.clientId : config.clientId), { body: data }).then(() => this.logger.info('Successfully reloaded application (/) commands.')).catch((e) => console.error(e));

            });
        });
    };
    loadEvents() {
        const EventsFolder = readdirSync('./src/events')
        let i = 0;
        EventsFolder.forEach(async (eventFolder) => {
            const events = readdirSync(`./src/events/${eventFolder}`).filter(c => c.split('.').pop() === 'js');
            if (eventFolder != 'player' && eventFolder != 'node') {
                events.forEach(async (eventStr)=> {
                    if (!events.length) throw Error('No event files found!');
                    const file = require(`../events/${eventFolder}/${eventStr}`);
                    const event = new file(this, file);
                    const eventName = eventStr.split('.')[0].charAt(0).toLowerCase() + eventStr.split('.')[0].slice(1);
                    this.on(eventName, (...args) => event.run(...args));
                    ++i;
                });

            };

        });
        this.logger.event(`Successfully loaded event ${i}.`)
    };
    async _connectMongodb() {
        await connect(this.config.database);
        this.logger.ready('Successfully connected to MongoDB.');
    };
    async connect() {
        super.login(this.config.token);
        this.loadEvents();
        this.loadCommands();

    };
};
