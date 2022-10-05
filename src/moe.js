const Client = require('./structures/Client');

const client = new Client();

client.connect();

module.exports = client;

process.on('uncaughtException', (error) => {
	client.logger.error(error);
});
process.on('unhandledRejection', (error) => {
	client.logger.error(error);
});
process.on('warning', (warn) => {
	client.logger.error(warn);
});
