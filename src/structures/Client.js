const { Client, Routes, REST, ActionRowBuilder, PermissionsBitField, ApplicationCommandType, GatewayIntentBits, Partials, Collection, EmbedBuilder, ButtonBuilder, SelectMenuBuilder, Colors } = require('discord.js');
const { connect, connection } = require('mongoose');
const { readdirSync } = require('node:fs');
const Logger = require('@structures/Logger');
const Cluster = require('discord-hybrid-sharding');
const Manager = require('@structures/Manager');
const Canvas = require('./Canvas');

module.exports = class Alpha extends Client {
  constructor() {
    super({
      allowedMentions: {
        parse: ['users', 'roles', 'everyone'],
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
      partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.User,
        Partials.Reaction,
      ],
      restTimeOffset: 0,
      restRequestTimeout: 20000,
    });

    this.commands = new Collection();
    this.config = require('@src/config');
    this.emotes = require('@src/emotes');
    this.aliases = new Collection();
    this.contextMenus = new Collection();
    this.cooldowns = new Collection();
    this.cluster = new Cluster.Client(this);
    this.logger = new Logger({
      displayTimestamp: true,
      displayDate: true,
    });
    this._connectMongodb();
    this.manager = new Manager(this);
    this.canvas = new Canvas();
  }
  /**
   * @param {import('discord.js').APIEmbed} data
   * @returns {EmbedBuilder}
   */
  embed(data) {
    return new EmbedBuilder(data).setColor('Blurple');
  }
  /**
   * @param {import('discord.js').APIButtonComponent} data
   * @returns {ButtonBuilder}
   */
  button(data) {
    return new ButtonBuilder(data);
  }
  /**
   * @param {import('discord.js').APISelectMenuComponent} data
   * @returns {SelectMenuBuilder}
   */
  menu(data) {
    return new SelectMenuBuilder(data);
  }
  /**
   * @param {import('discord.js').APIActionRowComponent} data
   * @returns {ActionRowBuilder}
   */
  row(data) {
    return new ActionRowBuilder(data);
  }

  loadCommands() {
    if (this.cluster.id !== 0) return;
    const data = [];
    let i = 0;
    const commandsFolder = readdirSync('./src/commands/');
    commandsFolder.forEach((category) => {
      const categories = readdirSync(`./src/commands/${category}/`).filter(
        (file) => file.endsWith('.js'),
      );
      categories.forEach((command) => {
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
        }
        if (cmd.slashCommand) {
          data.push({
            name: cmd.name,
            description: cmd.description.content,
            options: cmd.options,
            type: ApplicationCommandType.ChatInput,
          });
          if (cmd.permissions.user.length > 0)
            data.default_member_permissions = cmd.permissions.user
              ? PermissionsBitField.resolve(cmd.permissions.user).toString()
              : 0;
          ++i;
        }
        this.logger.event(`Successfully loaded [/] command ${i}.`);

        const rest = new REST({ version: '10' }).setToken(
          this.user ? this.token : require('@src/config').token,
        );

        rest
          .put(
            Routes.applicationCommands(
              this.user ? this.user.id : require('@src/config').clientId,
            ),
            { body: data },
          )
          .then(() =>
            this.logger.info('Successfully reloaded application (/) commands.'),
          )
          .catch((e) => this.logger.error(e.name, e.message));
      });
    });
  }
  loadEvents() {
    if (this.cluster.id !== 0) return;
    const EventsFolder = readdirSync('./src/events');
    let i = 0;
    EventsFolder.forEach(async (eventFolder) => {
      const events = readdirSync(`./src/events/${eventFolder}`).filter(
        (c) => c.split('.').pop() === 'js',
      );
      events.forEach(async (eventStr) => {
        if (!events.length) throw Error('No event files found!');
        const file = require(`../events/${eventFolder}/${eventStr}`);
        const event = new file(this, file);
        const eventName =
          eventStr.split('.')[0].charAt(0).toLowerCase() +
          eventStr.split('.')[0].slice(1);

        switch (eventFolder) {
          case 'player':
            this.manager.on(eventName, (...args) => event.run(...args));
            ++i;
            break;
          case 'node':
            this.manager.on(eventName, (...args) => event.run(...args));
            ++i;
            break;
          default:
            this.on(eventName, (...args) => event.run(...args));
            ++i;
            break;
        }
      });
    });
    this.logger.event(`Successfully loaded event ${i}.`);
  }
  async _connectMongodb() {
    if ([1, 2, 99].includes(connection.readyState)) return;
    await connect(this.config.database);
    this.logger.ready('Successfully connected to MongoDB.');
  }
  async connect() {
    super.login(this.config.token);
    this.loadEvents();
    this.loadCommands();
  }
};
