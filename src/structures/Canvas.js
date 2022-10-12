const nodeCanvas = require('@napi-rs/canvas');
const moment = require('moment');
const momentDurationFormatSetup = require('moment-duration-format');
const Alpha = require('./Client');
momentDurationFormatSetup(moment);

module.exports = class Canvas {
  /**
   *
   * @param {Alpha} client
   */
  constructor(client) {
    /**
     * @type {Alpha}
     */
    this.client = client;
    this.background = {
      type: 0,
      data: '#2F3136',
    };
  }
  async buildPlayerCard(
    image,
    artist,
    title,
    end,
    start,
    background = this.background,
  ) {
    const canvas = nodeCanvas.createCanvas(600, 150);
    const ctx = canvas.getContext('2d');

    const total = end - start;
    const progress = Date.now() - this.start;
    const progressF = formatTime(progress > total ? total : progress);
    const ending = formatTime(total);

    ctx.beginPath();
    if (background.type === 0) {
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#2F3136';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      const img = await nodeCanvas.loadImage(background.data);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    // draw image
    const img = await nodeCanvas.loadImage(image);
    ctx.drawImage(img, 30, 15, 120, 120);
    ctx.arc(125, 125, 100, 0, Math.PI * 2, true);

    // title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px MANROPE_BOLD,NOTO_COLOR_EMOJI';
    await renderEmoji(ctx, shorten(title, 30), 170, 40);

    // artist
    ctx.fillStyle = '#F1F1F1';
    ctx.font = '14px MANROPE_REGULAR,NOTO_COLOR_EMOJI';
    await renderEmoji(ctx, `by ${shorten(artist, 40)}`, 170, 70);

    // ending point
    ctx.fillStyle = '#B3B3B3';
    ctx.font = '14px MANROPE_REGULAR,NOTO_COLOR_EMOJI';
    await renderEmoji(ctx, ending, 430, 130);

    // progress
    ctx.fillStyle = '#B3B3B3';
    ctx.font = '14px MANROPE_REGULAR,NOTO_COLOR_EMOJI';
    await renderEmoji(ctx, progressF, 170, 130);

    // progressbar track
    ctx.rect(170, 170, 300, 4);
    ctx.fillStyle = '#E8E8E8';
    ctx.fillRect(170, 110, 300, 4);

    // progressbar
    ctx.fillStyle = '#1DB954';
    ctx.fillRect(170, 110, this.__calculateProgress(progress, total), 4);

    return canvas.encode('png');
  }
  __calculateProgress(progress, total) {
    const prg = (progress / total) * 300;
    if (isNaN(prg) || prg < 0) return 0;
    if (prg > 300) return 300;
    return prg;
  }
};

function shorten(text, len) {
  if (typeof text !== 'string') return '';
  if (text.length <= len) return text;
  return text.substr(0, len).trim() + '...';
}

/**
 *
 * @param {import('@napi-rs/canvas').SKRSContext2D} ctx
 * @param {string} message
 * @param {number} x
 * @param {number} y
 * @param {number} maxWidth
 */
function renderEmoji(ctx, message, x, y) {
  return ctx.fillText(message, x, y);
}

function formatTime(time) {
  if (!time) return '00:00';
  const fmt = moment.duration(time).format('dd:hh:mm:ss');

  const chunk = fmt.split(':');
  if (chunk.length < 2) chunk.unshift('00');
  return chunk.join(':');
}
