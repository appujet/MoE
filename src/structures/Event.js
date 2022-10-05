module.exports = class Event {

	/**
   *
   * @param {import('@structures/Client')} client
   * @param {String} file
   * @param {String} options
   */
	constructor(client, file, options = {}) {
		this.client = client;
		this.name = options.name || file.name;
		this.file = file;
	}

	/**
   *
   * @param  {...any} args
   * @returns {Promise<void>}
   */
	async _execute(...args) {
		try {
			await this.execute(...args);
		} catch (err) {
			this.client.logger.error(err);
		}
	}

};
