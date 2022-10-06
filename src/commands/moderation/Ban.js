const Command = require('@structures/Command');

module.exports = class Ban extends Command {
    constructor(client) {
        super(client, {
            name: 'ban',
            description: {
                content: 'Bans a user from the server.',
                usage: 'ban <user> [reason]',
                examples: ['ban @user', 'ban @user Spamming'],
            },
            aliases: ['banish'],
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
            options: [
                {
                    name: 'user',
                    description: 'The user to ban.',
                    type: 6,
                    required: true,
                },
                {
                    name: 'reason',
                    description: 'The reason for the ban.',
                    type: 3,
                    required: false,
                },
            ],
        });
    }
    /**
     * @param {import('@structures/Context')} ctx
     * @param {string[]} args
     */
    async run(ctx, args) {
        let user;
        if (ctx.interaction) user = ctx.interaction.options.getUser('user');
        else user = ctx.message.mentions.members.first() || ctx.guild.members.cache.get(args[0]);

        if (!user) return await ctx.sendMessage('Please provide a valid user.');
        if (user.id === ctx.author.id) return await ctx.sendMessage('You can\'t ban yourself.');
        if (user.id === ctx.client.user.id) return await ctx.sendMessage('You can\'t ban me.');
        if (user.id === ctx.guild.ownerId) return await ctx.sendMessage('You can\'t ban the owner.');
        if (ctx.member.roles.highest.position < user.roles.highest.position) return await ctx.sendMessage('You can\'t ban that user! He/She has a higher role than yours.');
        if (user.roles.highest.position >= ctx.guild.members.me.roles.highest.position) return await ctx.sendMessage('I can\'t ban that user! He/She has a higher role than mine.');
        if (user.id === this.client.user.id) return await ctx.sendMessage('Please don\'t ban me!');

        if (user.bannable) {
            const reason = args[1] || 'No reason provided.';
            await user.ban({ reason: reason });
            return await ctx.sendMessage(`Successfully banned \`${user.user.tag}\`.`);
        } else {
            return await ctx.sendMessage('I can\'t ban that user.');
        }
    }
};