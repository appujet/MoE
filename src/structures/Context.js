const {
  Message,
  CommandInteraction,
  EmbedBuilder,
  ChatInputCommandInteraction,
  BaseInteraction,
} = require("discord.js");

module.exports = class Context {
  constructor(ctx, args) {
    this.isInteraction =
      ctx instanceof CommandInteraction ||
      ctx instanceof ChatInputCommandInteraction ||
      ctx instanceof BaseInteraction;
    this.ctx = ctx;
    this.setArgs(args);
    this.interaction = this.isInteraction ? ctx : null;
    this.message = this.isInteraction ? null : ctx;
    this.id = ctx.id;
    this.applicationId = ctx.applicationId;
    this.channelId = ctx.channelId;
    this.guildId = ctx.guildId;
    this.client = ctx.client;
    this.author = ctx instanceof Message ? ctx.author : ctx.user;
    this.channel = ctx.channel;
    this.guild = ctx.guild;
    this.member = ctx.member;
    this.createdAt = ctx.createdAt;
    this.createdTimestamp = ctx.createdTimestamp;
    this.attachments = ctx.attachments;
  }

  setArgs(args) {
    if (this.isInteraction) {
      this.args = args.map((arg) => arg.value);
    } else {
      this.args = args;
    }
  }
  async sendMessage(content) {
    if (this.isInteraction) {
      this.msg = this.interaction.deferred
        ? await this.interaction.followUp(content)
        : await this.interaction.reply(content);
      return this.msg;
    } else {
      this.msg = this.message.channel.send(content);
      return this.msg;
    }
  }
  async sendDeferMessage(content) {
    if (this.isInteraction) {
      this.msg = await this.interaction.deferReply({ fetchReply: true });
      return this.msg;
    } else {
      this.msg = await this.channel.send(content);
      return this.msg;
    }
  }
  async sendFollowUp(content) {
    if (this.isInteraction) {
      await this.interaction.followUp(content);
    } else {
      this.channel.send(content);
    }
  }
  editMessage(content) {
    if (this.isInteraction) {
      return this.interaction.editReply(content);
    } else {
      return this.msg.edit(content);
    }
  }
  deleteMessage() {
    if (this.isInteraction) {
      return this.interaction.deleteReply();
    } else {
      return this.msg.delete();
    }
  }
  async invalidArgs(commandName, message, args, client) {
    try {
      let color = client.config.color ? client.config.color : "#59D893";
      let prefix = client.config.prefix;
      let command =
        client.commands.get(commandName) ||
        client.commands.get(client.aliases.get(commandName));
      if (!command)
        return await message
          .edit({
            embeds: [new EmbedBuilder().setColor(color).setDescription(args)],
            allowedMentions: {
              repliedUser: false,
            },
          })
          .catch(() => {});
      let embed = new EmbedBuilder()
        .setColor(color)
        .setAuthor({
          name: message.author.tag.toString(),
          iconURL: message.author
            .displayAvatarURL({ dynamic: true })
            .toString(),
        })
        .setDescription(`**${args}**`)
        .setTitle(`__${command.name}__`)
        .addFields([
          {
            name: "Usage",
            value: `\`${
              command.description.usage
                ? `${prefix}${command.name} ${command.description.usage}`
                : `${prefix}${command.name}`
            }\``,
            inline: false,
          },
          {
            name: "Example(s)",
            value: `${
              command.description.examples
                ? `\`${prefix}${command.description.examples.join(
                    `\`\n\`${prefix}`
                  )}\``
                : "`" + prefix + command.name + "`"
            }`,
          },
        ]);

      await this.msg.edit({
        content: null,
        embeds: [embed],
        allowedMentions: { repliedUser: false },
      });
    } catch (e) {
      console.error(e);
    }
  }
};
