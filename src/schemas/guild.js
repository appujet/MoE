const { model, Schema } = require('mongoose');
const { prefix } = require('@src/config');
const GuildSchema = new Schema({
    _id: { type: String, required: true},
    prefix: { type: String, default: prefix },
    language: { type: String, default: 'en-US' },
    welcomeChannel: { type: String, default: null },
    welcomeMessage: { type: String, default: null },
    leaveChannel: { type: String, default: null },
    leaveMessage: { type: String, default: null },
    modLogChannel: { type: String, default: null },
    eventsLogChannel: { type: String, default: null },
    messageLogChannel: { type: String, default: null },
    autoRole: { type: String, default: null },
});
module.exports = model('Guild', GuildSchema);