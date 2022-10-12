const Dispatcher = require('@root/src/structures/Dispatcher');
const { formatDuration, shuffle } = require('@root/src/utils/function');
const Event = require('@structures/Event');
const { TextChannel, AttachmentBuilder, ButtonStyle, Message, User, SelectMenuComponent, ButtonComponent, ActionRow } = require('discord.js');
const { Player } = require('shoukaku');

module.exports = class TrackStart extends Event {
  constructor(...args) {
    super(...args);
  }
  /**
   *
   * @param {Player} player
   * @param {import('shoukaku').Track} track
   * @param {TextChannel} channel
   * @param {import('shoukaku').Track[]} matchedTracks
   * @param {Dispatcher} dispatcher
   */
  async run(player, track, channel, matchedTracks, dispatcher) {
    const embed = this.client
      .embed()
      .setTitle('Now Playing')
      .setDescription(
        `${track.info.title} - [\`${formatDuration(track.info.length, true)}\`]`,
      );

    const matchedResults = matchedTracks.filter((v) => !Array.isArray(v) && v.info.uri !== track.info.uri).map((v) => {
      return {
        label: v.info.title,
        value: v.info.uri,
      };
    });

    const image = `https://img.youtube.com/vi/${track.info.identifier}/hqdefault.jpg`;

    const buffer = await this.client.canvas.buildPlayerCard(
      image,
      track.info.author,
      track.info.title,
      track.info.length,
      player.position,
    );

    const attachment = new AttachmentBuilder(buffer, {
      name: 'nowplaying.png',
    });

    const buttonsRow = this.client.row()
      .addComponents([
        this.client.button()
          .setEmoji({ name: '🔀' })
          .setCustomId('shuffle')
          .setStyle(ButtonStyle.Secondary),
        this.client.button()
          .setEmoji({ name: '◀️' })
          .setCustomId('backward')
          .setStyle(ButtonStyle.Secondary),
        this.client.button()
          .setEmoji({ name: '⏯️' })
          .setCustomId('pause')
          .setStyle(ButtonStyle.Secondary),
        this.client.button()
          .setEmoji({ name: '▶️' })
          .setCustomId('forward')
          .setStyle(ButtonStyle.Secondary),
        this.client.button()
          .setEmoji({ name: '🔁' })
          .setCustomId('repeat')
          .setStyle(ButtonStyle.Secondary),
      ]);

    const menuRow = this.client.row()
      .addComponents([
        this.client.menu()
          .setCustomId('results')
          .setPlaceholder('Play Similar songs')
          .setMaxValues(1)
          .setMinValues(1)
          .addOptions(matchedResults),
      ]);

    const message = await channel.send({
      embeds: [embed.setImage('attachment://nowplaying.png')],
      files: [attachment],
      components: [menuRow, buttonsRow],
    });

    this.interacte(message, dispatcher.requester, dispatcher, matchedTracks, player, track);
  }

  /**
   *
   * @param {Message} msg
   * @param {User} author
   * @param {Dispatcher} dispatcher
   * @param {import('shoukaku').Track[]} results
   * @param {Player} player
   * @param {import('shoukaku').Track} current
   */
  interacte(msg, author, dispatcher, results, player, current) {
    const collector = msg.createMessageComponentCollector({
      time: current.info.length,
      filter: (m) => m.user.id === author.id,
    });

    collector.on('collect', async (i) => {
      if (i.user.id !== author.id)
        return await i.reply({
          content: `Only **${author.tag}** can operate this buttons, Request one for yourselves.`,
        });

      switch (i.customId) {
        case 'results':
          const filtered = results.filter((v) => v.info.uri === i.values[0])[0];
          dispatcher.queue.push(filtered);
          await i.reply({ embeds: [this.client.embed().setDescription(`Added **${filtered.info.title}** to queue.`).setTitle('Music Queue')], ephemeral: true });
          break;
        case 'shuffle':
          await i.deferUpdate();
          shuffle(dispatcher.queue);
          break;
        case 'backward':
          await i.deferUpdate();
          player.seekTo(0 * 1000);
          break;
        case 'forward':
          await i.deferUpdate();
          player.stopTrack();
          break;
        case 'pause':
          await i.deferUpdate();
          player.setPaused(player.paused ? false : true);
          break;
        case 'repeat':
          await i.deferUpdate();
          switch (dispatcher.loop) {
            case 'repeat':
              dispatcher.loop = 'queue';
              break;
            case 'queue':
              dispatcher.loop = 'off';
              break;
            case 'off':
              dispatcher.loop = 'repeat';
              break;
          }
      }
    });

    collector.on('end', async () => {
      await msg.delete();
    });
  }
};
