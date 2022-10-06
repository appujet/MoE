const guildDb = require('@schemas/guild');

module.exports = class Functions {
    /**
     *
     * @param {import('discord.js').Guild} guildId
     * @returns {Promise<import('@schemas/guild')>}
     */
    static async createGuildDb(guildId) {
        let guild = await guildDb.findById({ _id: guildId });
        if (guild) return;
        guild = new guildDb({ _id: guildId });

        await guild.save();
        return guild;
    }
    /**
     *
     * @param {import('discord.js').Guild} guildId
     * @returns {Promise<import('@schemas/guild')>}
     */
    static async getPrefix(guildId) {
        const guild = await guildDb.findOne({ _id: guildId });

        return guild.prefix;
    }
};