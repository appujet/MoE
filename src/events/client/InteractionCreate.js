const {
  InteractionType,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const Event = require("../../structures/Event");
const Context = require("../../structures/Context");

module.exports = class InteractionCreate extends Event {
  constructor(...args) {
    super(...args);
  }
  async run(interaction) {
    let color = this.client.config.color ? this.client.config.color : "#59D893";

    if (interaction.type === InteractionType.ApplicationCommand) {
      const { commandName } = interaction;
      if (!commandName)
        return await interaction
          .reply({ content: "Unknow interaction!" })
          .catch(() => {});
      const prefix = this.client.config.prefix;
      let cmd = this.client.commands.get(interaction.commandName);
      if (!cmd || !cmd.slashCommand) return;
      const command = cmd.name.toLowerCase();

      const ctx = new Context(interaction, interaction.options.data);

      this.client.logger.command(
        "%s used by %s from %s",
        command,
        ctx.author.id,
        ctx.guild.id
      );
      if (
        !interaction.inGuild() ||
        !interaction.channel
          .permissionsFor(interaction.guild.members.me)
          .has(PermissionFlagsBits.ViewChannel)
      )
        return;

      if (
        !interaction.guild.members.me.permissions.has(
          PermissionFlagsBits.SendMessages
        )
      )
        return await interaction.author
          ?.send({
            content: `I don't have **\`SEND_MESSAGES\`** permission in \`${interaction.guild.name}\`\nchannel: <#${interaction.channelId}>`,
          })
          .catch(() => {});

      if (
        !interaction.guild.members.me.permissions.has(
          PermissionFlagsBits.EmbedLinks
        )
      )
        return await interaction.channel
          .send({ content: `I don't have **\`EMBED_LINKS\`** permission.` })
          .catch(() => {});

      if (
        !interaction.guild.members.me.permissions.has([
          PermissionFlagsBits.EmbedLinks,
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.UseApplicationCommands,
        ])
      )
        return await interaction
          .followUp({
            content: "I don't have enough permission to execute this cmd.",
            ephemeral: true,
          })
          .catch(() => {});

      if (cmd.permissions) {
        if (cmd.permissions.client) {
          if (
            !interaction.guild.members.me.permissions.has(
              cmd.permissions.client
            )
          )
            return await interaction
              .reply({
                content: `I don't have enough permissions to execute this cmd.`,
                ephemeral: true,
              })
              .catch(() => {});
        }

        if (cmd.permissions.user) {
          if (!interaction.member.permissions.has(cmd.permissions.user))
            return await interaction
              .reply({
                content: `You don't have enough permissions to execute this cmd.`,
                ephemeral: true,
              })
              .catch(() => {});
        }
        if (cmd.permissions.dev) {
          if (this.client.config.owners) {
            const findDev = this.client.config.owners.find(
              (x) => x === interaction.user.id
            );
            if (!findDev) return;
          }
        }
      }

      if (cmd.player) {
        if (cmd.player.voice) {
          if (!interaction.member.voice.channel)
            return await interaction
              .reply({
                content: `You must be connected to a voice channel to use this \`${cmd.name}\` cmd.`,
                ephemeral: true,
              })
              .catch(() => {});

          if (
            !interaction.guild.members.me.permissions.has(
              PermissionFlagsBits.Speak
            )
          )
            return await interaction
              .reply({
                content: `I don't have \`CONNECT\` permissions to execute this \`${cmd.name}\` cmd.`,
                ephemeral: true,
              })
              .catch(() => {});

          if (
            !interaction.guild.members.me.permissions.has(
              PermissionFlagsBits.Speak
            )
          )
            return await interaction
              .reply({
                content: `I don't have \`SPEAK\` permissions to execute this \`${cmd.name}\` cmd.`,
                ephemeral: true,
              })
              .catch(() => {});

          if (
            interaction.member.voice.channel.type ===
              ChannelType.GuildStageVoice &&
            !interaction.guild.members.me.permissions.has(
              PermissionFlagsBits.RequestToSpeak
            )
          )
            return await interaction
              .reply({
                content: `I don't have \`REQUEST TO SPEAK\` permission to execute this \`${cmd.name}\` cmd.`,
                ephemeral: true,
              })
              .catch(() => {});

          if (interaction.guild.members.me.voice.channel) {
            if (
              interaction.guild.members.me.voice.channelId !==
              interaction.member.voice.channelId
            )
              return await interaction
                .reply({
                  content: `You are not connected to ${interaction.guild.members.me.voice.channel} to use this \`${cmd.name}\` cmd.`,
                  ephemeral: true,
                })
                .catch(() => {});
          }
        }

        if (cmd.player.active) {
          if (!this.client.player.get(interaction.guildId))
            return await interaction
              .reply({
                content: `Nothing is playing right now.`,
                ephemeral: true,
              })
              .catch(() => {});
          if (!this.client.player.get(interaction.guildId).queue)
            return await interaction
              .reply({
                content: `Nothing is playing right now.`,
                ephemeral: true,
              })
              .catch(() => {});
          if (!this.client.player.get(interaction.guildId).queue.current)
            return await interaction
              .reply({
                content: `Nothing is playing right now.`,
                ephemeral: true,
              })
              .catch(() => {});
        }
      }

      try {
        return await cmd.run(this.client, ctx, ctx.args, prefix, color);
      } catch (error) {
        console.error(error);
        await interaction
          .reply({
            ephemeral: true,
            content: `An unexpected error occured, the developers have been notified.`,
          })
          .catch(() => {});
      }
    }
  }
};
