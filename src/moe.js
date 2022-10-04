const Client = require('@structures/Client');

const client = new Client();

client.connect();

module.exports = client;

process.on('uncaughtException', (e) => {
    client.logger.error(e);
   // channel.send({ embeds: [embed.setDescription(`\`\`\`${e}\`\`\``)] });

})
process.on('unhandledRejection', (e) => {
    client.logger.error(e);
    //channel.send({ embeds: [embed.setDescription(`\`\`\`${e}\`\`\``)] });
})
process.on('warning', (e) => {
    client.logger.error(e);
   // channel.send({ embeds: [embed.setDescription(`\`\`\`${e}\`\`\``)] });

})