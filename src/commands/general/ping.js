const Command = require('@structures/Command');

module.exports = class Ping extends Command {
    constructor(client) {
        super(client, {
            name: 'ping',
            description: {
                content: "Returns the latency of the bot.",
                usage: 'ping',
                examples: ['ping']
            },
            aliases: ['pong'],
            category: 'general',
            cooldown: 3,
            player: {
                voice: false,
                dj: false,
                active: false,
                djPerm: null,
            },
            permissions: {
                dev: false,
                client: ['SendMessages', 'ViewChannels', 'EmbedLinks'],
                user: [],
                voteRequired: false
            },
            slashCommand: true,
        });
    }
    async run(client, ctx, args) { 
        const msg = await ctx.sendDeferMessage(`Pinging...`);

        return ctx.editMessage(`Latency: \`${msg.createdTimestamp - ctx.createdTimestamp}ms.\` \nAPI Latency: \`${Math.round(client.ws.ping)}ms.\``);
    }
}