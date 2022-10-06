const { Guild, TextChannel } = require('discord.js');
const Moe = require('@structures/Client');
const { Player } = require('shoukaku');

class Dispatcher {

	/**
   *
   * @param {Moe} client
   * @param {Guild} guild
   * @param {TextChannel} channel
   * @param {Player} player
   */
	constructor(client, guild, channel, player) {
		/**
	 * @type {Moe}
	 */
		this.client = client;
		/**
	 * @type {Guild}
	 */
		this.guild = guild;
		/**
	 * @type {TextChannel}
	 */
		this.channel = channel;
		/**
	 * @type {Player}
	 */
		this.player = player;

		/**
	 * @type {Array<import('shoukaku').Track>}
	 */
		this.queue = [];
		/**
	 * @type {boolean}
	 */
		this.stopped = false;
		/**
	 * @type {import('shoukaku').Track}
	 */
		this.current = null;
		/**
	 * @type {'off'|'repeat'|'queue'}
	 */
		this.loop = 'off';

		this.player
			.on('start', () => {
				const { current } = this;

				const parsedDuration = this.client.utils.formatDuration(
					current.info.length,
					true
				);

				const embed = this.client
					.embed()
					.setTitle('🎵 Now Playing')
					.setDescription(
						`[${current.info.title}](${current.info.uri}) • \`[${parsedDuration}]\``
					);

				const thumbnail = this.displayThumbnail();

				if (thumbnail) {
					embed.setThumbnail(thumbnail);
				}

				this.channel
					.send({
						embeds: [embed]
					})
					.catch(() => null);
			})
			.on('end', () => {
				if (this.loop === 'repeat') this.queue.unshift(this.current);
				if (this.loop === 'queue') this.queue.push(this.current);
				this.play();
			})
			.on('stuck', () => {
				if (this.loop === 'repeat') this.queue.unshift(this.current);
				if (this.loop === 'queue') this.queue.push(this.current);
				this.play();
			})
			.on('closed', (...arr) => this._errorHandler(...arr))
			.on('error', (...arr) => this._errorHandler(...arr));
	}

	get manager() {
		return this.client.manager;
	}

	/**
   *
   * @param {Error} data
   */
	_errorHandler(data) {
		if (data instanceof Error || data instanceof Object) { this.client.logger.error(data); }
		this.queue.length = 0;
		this.destroy('error');
	}

	get exists() {
		return this.manager.players.has(this.guild.id);
	}

	/**
   *
   * @returns {void}
   */
	play() {
		if (this.introId && this.current === this.introId) {
			this.player.playTrack({
				track: this.current
			});
			return;
		}
		if (!this.exists || (!this.queue.length && !this.current)) {
			this.destroy('empty');
			return;
		}
		this.current = this.queue.shift();
		this.player.playTrack({ track: this.current.track });
	}

	/**
   *
   * @param {?string} reason
   * @returns {void}
   */
	destroy(reason) {
		this.queue.length = 0;
		this.player.connection.disconnect();
		this.manager.players.delete(this.guild.id);
		if (this.stopped) return;

		let embed = this.client.embed();

		if (reason === 'error') {
			embed.setDescription(`A error occured!`);
		} else if (reason === 'empty') {
			embed
				.setTitle('🎵 Queue is empty.')
				.setDescription(
					`I have successfully left the voice channel. Hope to see you again soon! 😔`
				);
		} else if (reason === 'leave') {
			embed.setDescription(
				`I have successfully left the voice channel. Hope to see you again soon! 😔`
			);
		} else {
			embed = null;
		}

		if (embed) {
			this.channel
				.send({
					embeds: [embed]
				})
				.catch(() => null);
		}
	}

	/**
   *
   * @param {import('shoukaku').Track} providedTrack
   * @returns {string}
   */
	displayThumbnail(providedTrack) {
		const track = providedTrack || this.current;
		return track.info.uri.includes('youtube') ?
			`https://img.youtube.com/vi/${track.info.identifier}/hqdefault.jpg` :
			null;
	}

	/**
     * @returns {void}
     */
	check() {
		if (this.queue.length && !this.current && !this.player.paused) {
			this.play();
		}
	}

}

module.exports = Dispatcher;
