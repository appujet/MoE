const Command = require('@structures/Command');
const guildDb = require('@schemas/guild');

module.exports = class Prefix extends Command {
    constructor(client) {
        super(client, {
            name: 'prefix',
            description: {
                content: 'Sets the prefix for the bot.',
                usage: 'prefix <prefix>',
                examples: ['prefix !'],
            },
            aliases: ['setprefix'],
            category: 'settings',
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
                user: ['ManageGuild'],
                voteRequired: false,
            },
            slashCommand: true,
            options: [
                {
                    name: 'prefix',
                    description: 'The prefix to set.',
                    type: 3,
                    maxLength: 20,
                    required: false,
                },
            ],
        });
    }
    async run(ctx, args) {
        const data = await guildDb.findOne({ _id: ctx.guild.id });
        if (!args[0]) {
            return await ctx.sendMessage(`The current prefix is \`${data.prefix}\`.`);
        }
        const pref = args[0].replace(/_/g, '');
        if (pref.length > 20) return await ctx.sendMessage('The prefix can\'t be longer than 20 characters.');
        await data.updateOne({ prefix: pref });
        return await ctx.sendMessage(`successfully set the prefix to \`${pref}\`.`);
    }
};