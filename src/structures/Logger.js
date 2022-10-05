const { Signale } = require('signale');
const Moe = require('./Client');

module.exports = class Logger extends Signale {

	/**
   *
   * @param {import("signale").SignaleConfig} config
   * @param {Moe} client
   */
	constructor(config, client) {
		super({
			config: config,
			types: {
				info: {
					badge: 'ℹ',
					color: 'blue',
					label: 'info'
				},
				warn: {
					badge: '⚠',
					color: 'yellow',
					label: 'warn'
				},
				error: {
					badge: '✖',
					color: 'red',
					label: 'error'
				},
				debug: {
					badge: '🐛',
					color: 'magenta',
					label: 'debug'
				},
				cmd: {
					badge: '⌨️',
					color: 'green',
					label: 'cmd'
				},
				event: {
					badge: '🎫',
					color: 'cyan',
					label: 'event'
				},
				ready: {
					badge: '✔️',
					color: 'green',
					label: 'ready'
				},
				command: {
					badge: '🛠️',
					color: 'green',
					label: 'command'
				}
			},
			scope: client ?
				`Shard ${`00${client.shard.ids[0]}`.slice(-2)}` :
				'Manager'
		});
	}

};
