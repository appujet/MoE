const { Guild, TextChannel } = require('discord.js');
const Moe = require('@structures/Client');
const { Player } = require('shoukaku');
const { EventEmitter } = require('events');

class Dispatcher extends EventEmitter {
  /**
   *
   * @param {Moe} client
   * @param {Guild} guild
   * @param {TextChannel} channel
   * @param {Player} player
   */
  constructor(client, guild, channel, player) {
    super();
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
      .on('start', (data) =>
        this.manager.emit('trackStart', this.player, this.current, this.channel, data),
      )
      .on('end', (data) => {
        this.manager.emit('trackEnd', this.player, this.current, data);
        if (!this.queue.length) this.manager.emit('queueEnd', this.player, data);
      })
      .on('stuck', (data) =>
        this.manager.emit('trackStuck', this.player, this.current, data),
      )
      .on('error', (...arr) => {
        this.manager.emit('trackError', this.player, this.current, ...arr);
        this._errorHandler(...arr);
      })
      .on('closed', (...arr) => {
        this.manager.emit('socketClosed', this.player, ...arr);
        this._errorHandler(...arr);
      });
  }

  get manager() {
    return this.client.manager;
  }

  /**
   *
   * @param {Error} data
   */
  _errorHandler(data) {
    if (data instanceof Error || data instanceof Object) {
      this.client.logger.error(data);
    }
    this.queue.length = 0;
    this.destroy('error');
  }

  get exists() {
    return this.manager.players.has(this.guild.id);
  }

  play() {
    if (this.introId && this.current === this.introId) {
      this.player.playTrack({
        track: this.current,
      });
      return;
    }
    if (!this.exists || (!this.queue.length && !this.current)) {
      this.destroy();
      return;
    }
    this.current = this.queue.shift();
    this.player.playTrack({ track: this.current.track });
  }

  destroy() {
    this.queue.length = 0;
    this.player.connection.disconnect();
    this.manager.players.delete(this.guild.id);
    if (this.stopped) return;
    this.manager.emit('playerDestroy', this.player);
  }

  /**
   *
   * @param {import('shoukaku').Track} providedTrack
   * @returns {string}
   */
  displayThumbnail(providedTrack) {
    const track = providedTrack || this.current;
    return track.info.uri.includes('youtube')
      ? `https://img.youtube.com/vi/${track.info.identifier}/hqdefault.jpg`
      : null;
  }

  check() {
    if (this.queue.length && !this.current && !this.player.paused) {
      this.play();
    }
  }
}

module.exports = Dispatcher;
