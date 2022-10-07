const Command = require('@structures/Command');
module.exports = class Banlist extends Command {
    constructor(client) {
        super(client, {
            name: 'banlist',
            description: {
                content: 'Returns the list of banned users in the server.',
                usage: 'banlist',
                examples: ['banlist'],
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
                voteRequired: false,
            },
            slashCommand: true,
        });
    }
    /**
     * @param {import('discord.js').Message} ctx
     * @param {string[]} args
     */
    async run(ctx, args) {
        const bans = await ctx.guild.bans.fetch();
        if (!bans.size) return await ctx.sendMessage('There are no banned users in this server.');
        let pagesNum = Math.ceil(bans.size / 10);
        if (pagesNum === 0) pagesNum = 1;
        const list = bans.map((b) => `**${b.user.tag}** ・**Reason:** ${b.reason || 'No reason'}`);
        const pages = [];
        for (let i = 0; i < pagesNum; i++) {
            const str = list.slice(i * 10, i * 10 + 10).join('\n');
            const embed = this.client.embed()
                .setTitle(`Banned Users in ${ctx.guild.name}`)
                .setDescription(str)
                .setFooter({ text: `Page ${i + 1} of ${pagesNum}` })
                .setColor(this.client.config.color);
            pages.push(embed);
        }
        await ctx.paginate(ctx, pages);
    }
};