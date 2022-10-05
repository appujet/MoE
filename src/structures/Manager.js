const { Collection, Guild, GuildMember, TextChannel } = require('discord.js');
const { Shoukaku, Connectors, Node } = require('shoukaku');
const Moe = require('@structures/Client');
const Dispatcher = require('@structures/Dispatcher');

class Manager {

	/**
   *
   * @param {Moe} client
   */
	constructor(client) {
		/**
	 * @type {Moe}
	 */
		this.client = client;
		/**
	 * @type {Shoukaku}
	 */
		this.shoukaku = new Shoukaku(
			new Connectors.DiscordJS(this.client),
			this.client.config.nodes,
			{
				moveOnDisconnect: false,
				resumable: false,
				resumableTimeout: 30,
				reconnectTries: 2,
				restTimeout: 10000
			}
		);

		/**
	 * @type {Collection<string, Dispatcher>}
	 */
		this.players = new Collection();

		this.shoukaku.on('ready', (name, resumed) => {
			this.client.logger.ready(
				'Shoukaku Handler',
				`LAVALINK => [STATUS] ${name} successfully connected.`,
				`This connection is ${resumed ? 'resumed' : 'a new connection'}`
			);
		});

		this.shoukaku.on('error', (name, error) => {
			this.client.logger.error(`LAVALINK => ${name}: Error Caught.`, error);
		});

		this.shoukaku.on('close', (name, code, reason) =>
			this.client.logger.warn(
				'Shoukaku Handler',
				`LAVALINK => ${name}: Closed, Code ${code}`,
				`Reason ${reason || 'No reason'}.`
			)
		);

		this.shoukaku.on('disconnect', (name, players, moved) => {
			this.client.logger.info(
				'Shoukaku Handler',
				`LAVALINK => ${name}: Disconnected`,
				moved ? 'players have been moved' : 'players have been disconnected'
			);
		});

		this.shoukaku.on('debug', (name, reason) =>
			this.client.logger.info(
				'Shoukaku Handler',
				`LAVALINK => ${name}`,
				reason || 'No reason'
			)
		);
	}
	/**
   *
   * @param {string} guildId Guild ID
   * @returns {Dispatcher}
   */
	getPlayer(guildId) {
		return this.players.get(guildId);
	}
	/**
   *
   * @param {Guild} guild Guild
   * @param {GuildMember} member Member
   * @param {TextChannel} channel Channel
   * @param {Node} givenNode Node
   * @returns {Promise<Dispatcher>}
   */
	async spawn(guild, member, channel, givenNode) {
		const existing = this.getPlayer(guild.id);

		if (existing) return existing;

		const node = givenNode || this.shoukaku.getNode();

		const player = await node.joinChannel({
			guildId: guild.id,
			shardId: guild.shardId,
			channelId: member.voice.channelId,
			deaf: true
		});

		const dispatcher = new Dispatcher(this.client, guild, channel, player);

		this.players.set(guild.id, dispatcher);

		return dispatcher;
	}

	/**
     *
     * @param {string} query
     * @returns {any}
    */
	async search(query) {
		const node = await this.shoukaku.getNode();

		let result;
		try {
			result = await node.rest.resolve(query);
		} catch (err) {
			this.client.logger.log(
				'Shoukaku Handler',
				`LAVALINK => Error while searching for ${query}`
			);
			return null;
		}

		return result;
	}

}

module.exports = Manager;
