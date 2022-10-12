const Event = require('@structures/Event');
const { Node } = require('shoukaku');

module.exports = class NodeDestroy extends Event {
  constructor(...args) {
    super(...args);
  }
  /**
   *
   * @param {Node} node
   */
  async run(node, code, reason) {
    this.client.logger.warn(`[Node] - ${node.name} destroyed!`, code, reason);
  }
};
