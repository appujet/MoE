const { Manager } = require('discord-hybrid-sharding');
const signale = require('signale');
const { token } = require('./config');

signale.config({
	displayFilename: true,
	displayTimestamp: true,
	displayDate: false
});

const manager = new Manager('./src/moe.js', {
	mode: 'process',
	shardsPerClusters: 4,
	token,
	totalClusters: 'auto',
	totalShards: 'auto'
});

manager.on('clusterCreate', (cluster) => {
	signale.info(`[ Launched ] Cluster ${cluster.id}`);
});

manager.spawn({ timeout: -1 }).catch((err) => console.log(err));
