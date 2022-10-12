const { Manager } = require('discord-hybrid-sharding');
require('module-alias/register');
const signale = require('signale');
const { token } = require('@src/config');

signale.config({
  displayFilename: true,
  displayTimestamp: true,
  displayDate: false,
});

const manager = new Manager('./src/moe.js', {
  mode: 'process',
  shardsPerClusters: 0,
  token,
  totalClusters: 'auto',
  totalShards: 'auto',
});

manager.on('clusterCreate', cluster => {
  signale.info(`[ Launched ] Cluster ${cluster.id}`);
});

manager.spawn({ timeout: -1 }).catch((err) => signale.error(err));
