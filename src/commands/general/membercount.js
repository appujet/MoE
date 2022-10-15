const Command = require('@structures/Command');

module.exports = class Ping extends Command {
    constructor(client) {
        super(client, {
            name: 'membercount',
            description: {
                content: 'Displays the number of members in the server.',
                usage: 'membercount',
                examples: ['membercount'],
            },
            aliases: ['mc'],
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
                voteRequired: false,
            },
            slashCommand: true,
        });
    }
    async run(ctx, args) {
        const msg = await ctx.sendDeferMessage('Counting...');

        return await ctx.editMessage(`Membercount - ${ctx.guild.MemberCount}`);
    }
};
