const Command = require('@structures/Command');

module.exports = class Kick extends Command {
    constructor(client) {
        super(client, {
            name: 'kick',
            description: {
                content: 'Kicks a user from the server.',
                usage: 'Kick <user> [reason]',
                examples: ['Kick @user', 'Kick @user Spamming'],
            },
            aliases: ['kickout'],
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
                client: ['SendMessages', 'ViewChannels', 'EmbedLinks', 'KickMembers'],
                user: ['KickMembers'],
                voteRequired: false,
            },
            slashCommand: true,
            options: [
                {
                    name: 'user',
                    description: 'The user to kick.',
                    type: 6,
                    required: true,
                },
                {
                    name: 'reason',
                    description: 'The reason for kicking out.',
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
        let reason;
        if(ctx.interaction) reason = ctx.interaction.options.getString("reason") ||'No reason provided.';
        else reason = args.slice(1).join(" ") || 'No reason provided.' ;
        
        if (!user) return await ctx.sendMessage('Please provide a valid user.');
        if (user.id === ctx.author.id) return await ctx.sendMessage('You can\'t kick yourself.');
        if (user.id === ctx.client.user.id) return await ctx.sendMessage('You can\'t kick me.');
        if (user.id === ctx.guild.ownerId) return await ctx.sendMessage('You can\'t kick the owner.');
        if (ctx.member.roles.highest.position < user.roles.highest.position) return await ctx.sendMessage('You can\'t kick that user! He/She has a higher role than yours.');
        if (user.roles.highest.position >= ctx.guild.members.me.roles.highest.position) return await ctx.sendMessage('I can\'t kick that user! He/She has a higher role than mine.');
        if (user.id === this.client.user.id) return await ctx.sendMessage('Please don\'t kick me!');

        if (user.kickable) {
            await user.kick({ reason: reason });
            return await ctx.sendMessage(`Successfully kicked \`${user.user.tag}\`.`);
        } else {
            return await ctx.sendMessage('I can\'t kick that user.');
        }
    }
};
