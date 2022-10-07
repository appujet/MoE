/**
 * @typedef {Object} CommandOptions Class Properties
 * @property {string} name Name for the command
 * @property {{ content: string; usage: string; examples: Array<string>}} description A description with three more properties for the command
 * @property {?Array<string>} aliases A array of aliases for the command
 * @property {?number} cooldown The cooldown for the command
 * @property {?{ voice: boolean; dj: boolean; active: boolean; djPerm: any }} player Dispatcher checks
 * @property {?{ dev: boolean; client: import('discord.js').PermissionResolvable; user: import('discord.js').PermissionResolvable; voteRequired: boolean; }} permissions Permission Resolves
 * @property {?boolean} slashCommand To specify if it's a slash command
 * @property {?import('discord.js').ApplicationCommandOption} options Slash Command options
 * @property {?string} category The category the command belongs to
 */

module.exports = class Command {
  /**
   *
   * @param {import('@structures/Client')} client
   * @param {CommandOptions} options
   */
  constructor(client, options) {
    /**
     * @type {import('@structures/Client')} Extended Client
     */
    this.client = client;
    this.name = options.name;
    this.description = {
      content: options.description
        ? options.description.content || "No description provided"
        : "No description provided",
      usage: options.description
        ? options.description.usage || "No usage provided"
        : "No usage provided",
      examples: options.description
        ? options.description.examples || "No examples provided"
        : "No examples provided",
    };
    this.aliases = options.aliases || "N/A";
    this.cooldown = options.cooldown || 3;
    this.player = {
      voice: options.player ? options.player.voice || false : false,
      dj: options.player ? options.player.dj || false : false,
      active: options.player ? options.player.active || false : false,
      djPerm: options.player ? options.player.djPerm || null : null,
    };
    this.permissions = {
      dev: options.permissions ? options.permissions.dev || false : false,
      client: options.permissions
        ? options.permissions.client || []
        : ["SendMessages", "ViewChannel", "EmbedLinks"],
      user: options.permissions ? options.permissions.user || [] : [],
      voteRequired: options.permissions
        ? options.permissions.voteRequired || false
        : false,
    };
    this.slashCommand = options.slashCommand || false;
    this.options = options.options || [];
    this.category = options.category || "general";
  }
};
