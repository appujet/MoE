const Client = require("./structures/Client");

const client = new Client();

client.connect();

module.exports = client;

<<<<<<< HEAD
process.on("uncaughtException", (e) => {
  client.logger.error(e);
});
process.on("unhandledRejection", (e) => {
  client.logger.error(e);
});
process.on("warning", (e) => {
  client.logger.error(e);
});
=======
process.on('uncaughtException', (e) => {
    client.logger.error(e);
})
process.on('unhandledRejection', (e) => {
    client.logger.error(e);
})
process.on('warning', (e) => {
    client.logger.error(e);
})
>>>>>>> 708a161e2244f3b9dc5e2f78a3f08c16fd47f457
