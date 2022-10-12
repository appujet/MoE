const Context = require('@root/src/structures/Context');
const Dispatcher = require('@root/src/structures/Dispatcher');
const { formatDuration } = require('@root/src/utils/function');
const Command = require('@structures/Command');
const {
  CommandInteractionOptionResolver,
  ApplicationCommandOptionType,
  Message,
  User,
  Colors,
} = require('discord.js');

module.exports = class Play extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      description: {
        content: 'Plays audio from any supported source.',
        usage: '<song URL or name>',
        examples: ['play alone'],
      },
      aliases: ['p'],
      category: 'Music',
      cooldown: 3,
      player: {
        voice: true,
        dj: false,
        active: false,
        djPerm: null,
      },
      permissions: {
        dev: false,
        client: ['SendMessages', 'ViewChannels', 'EmbedLinks', 'Connect'],
        user: ['SendMessages'],
        voteRequired: false,
      },
      slashCommand: true,
      options: [
        {
          name: 'query',
          description: 'Song name or URL to play.',
          required: true,
          type: ApplicationCommandOptionType.String,
          autocomplete: true,
        },
      ],
    });
  }

  /**
   *
   * @param {Context} ctx
   * @param {string[] | CommandInteractionOptionResolver} args
   */
  async run(ctx, args) {
    if (!args.length)
      return await ctx.channel.send({
        embeds: [
          this.client
            .embed()
            .setDescription('Please provide an URL or search query'),
        ],
      });

    /**
     * @type {string}
     */
    const query = args.length > 1 ? args.join(' ') : args[0];
    const isURL = this.checkURL(query);
    const result = await this.client.manager.search(isURL ? query : `ytsearch:${query}`);
    const dispatcher = await this.client.manager.spawn(
      ctx.guild,
      ctx.member,
      ctx.channel,
    );
    const embed = this.client.embed();
    const row = this.client.row;

    // LoadType checking
    switch (result.loadType) {
      case 'LOAD_FAILED':
        await ctx.channel.send({
          embeds: [embed.setDescription('Failed to load track try again')],
        });
        break;
      case 'NO_MATCHES':
        await ctx.channel.send({
          embeds: [embed.setDescription('No matches found for given query')],
        });
        break;
      case 'SEARCH_RESULT':
        const buttons = result.tracks.slice(0, 5).map((value, index) => {
          return {
            type: 2,
            emoji: {
              name: `${this.client.emotes[++index]}`,
              id: null,
              animated: false,
            },
            custom_id: `${value.info.uri}`,
            style: 2,
          };
        });
        const intialDescription = result.tracks
          .slice(0, 5)
          .map(
            (value, index) =>
              `${++index} - [${value.info.title}](${value.info.uri
              }) [\`${formatDuration(value.info.length, true)}\`]`,
          )
          .join('\n');
        embed.setDescription(
          `Multiple tracks found. Please choose one of the following\n\n${intialDescription}`,
        );
        const msg = await ctx.channel.send({
          embeds: [
            embed.setAuthor({
              name: ctx.author.tag,
              iconURL: ctx.author.displayAvatarURL(),
            }),
          ],
          components: [
            row({
              type: 1,
              components: buttons,
            }),
            this.client.row({
              type: 1,
              components: [
                {
                  type: 2,
                  emoji: {
                    name: '⏹️',
                    id: null,
                    animated: false,
                  },
                  custom_id: 'cancel',
                  style: 2,
                },
              ],
            }),
          ],
        });
        await this.interacte(msg, ctx.author, dispatcher, result);
        break;
      case 'TRACK_LOADED':
        dispatcher.queue.push(result.tracks[0]);
        dispatcher.check();
        await ctx.channel.send({
          embeds: [
            embed
              .setTitle('Music Queue')
              .setDescription(
                `Added **${result.tracks[0].info.title}** to queue.`,
              ),
          ],
        });
        break;
      case 'PLAYLIST_LOADED':
        dispatcher.queue.push(...result.tracks);
        dispatcher.check();
        await ctx.channel.send({
          embeds: [
            embed
              .setDescription(
                `Added **${result.playlistInfo.name}** with **${result.tracks.length} Songs!**`,
              )
              .setTitle('Music Queue'),
          ],
        });
        break;
    }
  }

  /**
   *
   * @param {string} string
   * @returns {boolean}
   */
  checkURL(string) {
    try {
      new URL(string);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   *
   * @param {Message} msg
   * @param {User} author
   * @param {Dispatcher} dispatcher
   * @param {import('shoukaku').LavalinkResponse} result
   */
  async interacte(msg, author, dispatcher, result) {
    const collector = msg.createMessageComponentCollector({
      max: 1,
      time: 60 * 1000,
      filter: (m) => m.user.id === author.id,
    });

    collector.on('collect', async (i) => {
      await i.deferUpdate();
      if (i.user.id !== author.id)
        return await i.reply({
          content: `Only **${author.tag}** can operate this buttons, Request one for yourselves.`,
        });
      switch (i.customId) {
        case 'cancel':
          collector.stop();
          break;
        default:
          const find = result.tracks
            .slice(0, 5)
            .filter((value) => value.info.uri === i.customId)[0];
          dispatcher.queue.push(find);
          dispatcher.check();
          await msg.edit({
            embeds: [
              {
                description: `Added **${find.info.title}** to queue.`,
                title: 'Music Queue',
                color: Colors.Blurple,
              },
            ],
            components: [],
          });
          break;
      }
    });

    collector.on('end', async () => {
      await msg
        .edit({
          components: [
            {
              type: 1,
              components: [
                ...msg.components[0].components.map((v) => {
                  return {
                    type: v.data.type,
                    emoji: v.data.emoji,
                    style: v.data.style,
                    custom_id: v.data.custom_id,
                    disabled: true,
                  };
                }),
              ],
            },
            {
              type: 1,
              components: [
                ...msg.components[1].components.map((v) => {
                  return {
                    type: v.data.type,
                    emoji: v.data.emoji,
                    style: v.data.style,
                    custom_id: v.data.custom_id,
                    disabled: true,
                  };
                }),
              ],
            },
          ],
        }).catch((err) => this.client.logger.error(err));
      });
    }
  };
