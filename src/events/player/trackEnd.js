const Dispatcher = require('@root/src/structures/Dispatcher');
const Event = require('@structures/Event');
const { TextChannel } = require('discord.js');
const { Player } = require('shoukaku');

module.exports = class TrackEnd extends Event {
    constructor(...args) {
        super(...args);
    }
    /**
     *
     * @param {Player} player
     * @param {import('shoukaku').Track} track
     * @param {TextChannel} channel
     * @param {Dispatcher} dispatcher
     */
    async run(player, track, channel, dispatcher) {
        if (dispatcher.loop === 'repeat') dispatcher.queue.unshift(track);
        if (dispatcher.loop === 'queue') dispatcher.queue.push(track);
        for (let i = 0; i < dispatcher.matchedTracks.length; i++) {
            dispatcher.matchedTracks.pop();
        }
        await channel.send({ embeds: [this.client.embed().setDescription('No more tracks have been added in queue so i left the voice channel')] });
        dispatcher.play();
    }
};
