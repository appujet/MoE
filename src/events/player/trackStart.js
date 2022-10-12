const { formatDuration } = require('@root/src/utils/function');
const Event = require('@structures/Event');
const { TextChannel, AttachmentBuilder } = require('discord.js');
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
   */
  async run(player, track, channel) {
    const embed = this.client.embed()
    .setTitle('Now Playing')
    .setDescription(`${track.info.title} - [\`${formatDuration(track.info.length, true)}\`]`);

    const image = `https://img.youtube.com/vi/${track.info.identifier}/hqdefault.jpg`;

    const buffer = await this.client.canvas.buildPlayerCard(image, track.info.author, track.info.title, track.info.length, player.position);

    const attachment = new AttachmentBuilder(buffer, { name: 'nowplaying.png' });

    await channel.send({
      embeds: [embed.setImage('attachment://nowplaying.png')],
      files: [attachment],
    });
  }
};
