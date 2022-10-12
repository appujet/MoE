const Event = require('@structures/Event');
const { Node, Player } = require('shoukaku');

module.exports = class NodeDisconnect extends Event {
  constructor(...args) {
    super(...args);
  }
  /**
   *
   * @param {Node} node
   * @param {Player[]} players
   */
  async run(node, players) {
    this.client.logger.warn(`[Node] - Connection disconnected from ${node.name}`, `Player size [${players.length}]`);
  }
};
