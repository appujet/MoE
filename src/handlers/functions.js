/* eslint-disable no-const-assign */
/* eslint-disable no-shadow */
const guildDb = require('@schemas/guild');
const { CommandInteraction, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

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
    static async paginate(ctx, embed) {
        if (embed.length < 2) {
            if (ctx instanceof CommandInteraction) {
                ctx.deferred ? ctx.followUp({ embeds: embed }) : ctx.reply({ embeds: embed });
                return;
            } else {
                ctx.channel.send({ embeds: embed });
                return;
            }
        }
        const page = 0;
        const getButton = (page) => {
            const firstEmbed = page === 0;
            const lastEmbed = page === embed.length - 1;
            const pageEmbed = embed[page];
            const first = new ButtonBuilder()
                .setCustomId('first')
                .setEmoji('⏪')
                .setStyle(ButtonStyle.Primary);
            if (firstEmbed) first.setDisabled(true);
            const back = new ButtonBuilder()
                .setCustomId('back')
                .setEmoji('◀️')
                .setStyle(ButtonStyle.Primary);
            if (firstEmbed) back.setDisabled(true);
            const next = new ButtonBuilder()
                .setCustomId('next')
                .setEmoji('▶️')
                .setStyle(ButtonStyle.Primary);
            if (lastEmbed) next.setDisabled(true);
            const last = new ButtonBuilder()
                .setCustomId('last')
                .setEmoji('⏩')
                .setStyle(ButtonStyle.Primary);
            if (lastEmbed) last.setDisabled(true);
            const stop = new ButtonBuilder()
                .setCustomId('stop')
                .setEmoji('⏹️')
                .setStyle(ButtonStyle.Danger);
            const row = new ActionRowBuilder()
                .addComponents(first, back, stop, next, last);
            return { embeds: [pageEmbed], components: [row] };
        };
        const msgOptions = getButton(0);
        let msg;
        if (ctx instanceof CommandInteraction) {
            msg = await ctx.deferred ? ctx.followUp({ ...msgOptions, fetchReply: true }) : ctx.reply({ ...msgOptions, fetchReply: true });
        } else {
            msg = await ctx.channel.send({ ...msgOptions });
        }
        let author;
        if (ctx instanceof CommandInteraction) {
            author = ctx.user;
        } else {
            author = ctx.author;
        }
        const filter = (interaction) => interaction.user.id === author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });
        collector.on('collect', async (interaction) => {
            if (interaction.user.id === author.id) {
                await interaction.deferUpdate();
                if (interaction.customId === 'fast') {
                    if (page !== 0) {
                        page = 0;
                        const newEmbed = getButton(page);
                        await interaction.editReply(newEmbed);
                    }
                }
                if (interaction.customId === 'back') {
                    if (page !== 0) {
                        page--;
                        const newEmbed = getButton(page);
                        await interaction.editReply(newEmbed);
                    }
                }
                if (interaction.customId === 'stop') {
                    collector.stop();
                    await interaction.editReply({ embeds: [embed[page]], components: [] });
                }
                if (interaction.customId === 'next') {
                    if (page !== embed.length - 1) {
                        page++;
                        const newEmbed = getButton(page);
                        await interaction.editReply(newEmbed);
                    }
                }
                if (interaction.customId === 'last') {
                    if (page !== embed.length - 1) {
                        page = embed.length - 1;
                        const newEmbed = getButton(page);
                        await interaction.editReply(newEmbed);
                    }

                }
            } else {
                await interaction.reply({ content: 'You can\'t use this button', ephemeral: true });
            }
        });

        collector.on('end', async () => {
            await msg.edit({ embeds: [embed[page]], components: [] });
        });
    }
};