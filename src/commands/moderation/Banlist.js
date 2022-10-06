const Command = require('@structures/Command');

module.exports = class Banlist extends Command {
    constructor(client) {
        super(client, {
            name: 'banlist',
            description: {
                content: "Returns the list of banned users in the server.",
                usage: 'banlist',
                examples: ['banlist']
            },
            category: 'moderation',
            cooldown: 3,
            player: {
                voice: false,
                dj: false,
                active: false,
                djPerm: null,
            },
            permissions: {
                dev: false,
                client: ['SendMessages', 'ViewChannels', 'EmbedLinks', 'BanMembers'],
                user: ['BanMembers'],
                voteRequired: false
            },
            slashCommand: true,
        });
    }
    /**
     * @param {import('@structures/CommandContext')} ctx
     * @param {string[]} args
     */
    async run(ctx, args) {
        const bans = await ctx.
        if (!bans.size) return ctx.sendError(ctx.guild, 'There are no banned users in this server.');

        const embed = new ctx.EmbedBuilder();
        embed.setTitle(`Banned users in ${ctx.guild.name}`);
        embed.setDescription(bans.map(ban => `${ban.user.tag} - ${ban.user.id}`).join('\n'));
        embed.setFooter(`Total: ${bans.size} banned users.`);

        return ctx.send(embed);
    }
}