module.exports = class Command {
    /**
     * 
     * @param {import('@structures/Client')} client 
     * @param {String} options 
     */
    constructor(client, options) {
        this.client = client;
        this.name = options.name;
        this.description = {
            content: options.description ? (options.description.content || 'No description provided') : 'No description provided',
            usage: options.description ? (options.description.usage || 'No usage provided') : 'No usage provided',
            examples: options.description ? (options.description.examples || 'No examples provided') : 'No examples provided',
        };
        this.aliases = options.aliases || 'N/A';
        this.cooldown = options.cooldown || 3;
        this.player = {
            voice: options.player ? (options.player.voice || false) : false,
            dj: options.player ? (options.player.dj || false) : false,
            active: options.player ? (options.player.active || false) : false,
            djPerm: options.player ? (options.player.djPerm || null) : null,
        };
        this.permissions = {
            dev: options.permissions ? (options.permissions.dev || false) : false,
            client: options.permissions ? (options.permissions.client || []) : ["SendMessages", "ViewChannel",  "EmbedLinks"],
            user: options.permissions ? (options.permissions.user || []) : [],
            voteRequired: options.permissions ? (options.permissions.voteRequired || false) : false,
        };
        this.slashCommand = options.slashCommand || false;
        this.options = options.options || [];
        this.category = options.category || 'general';
    }
};