const Event = require('@structures/Event');
const { Node } = require('shoukaku');

module.exports = class NodeError extends Event {
  constructor(...args) {
    super(...args);
  }
  /**
   *
   * @param {Node} node
   */
  async run(node, error) {
    this.client.logger.error(`[Node] - Encountered an error on node ${node.name}`, error.name, error.message);
  }
};
