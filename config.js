const fs = require('fs');
const path = require('path');

let config = {
    owners: [],
    Guild: "",
    prefix: "!",
    token: "",
    botId: ""
};

// Try to load from config.json if it exists (local development)
if (fs.existsSync(path.join(__dirname, 'config.json'))) {
    try {
        config = require('./config.json');
    } catch (error) {
        console.error("Error loading config.json:", error);
    }
}

// Override with Environment Variables (Railway/Production)
if (process.env.TOKEN) config.token = process.env.TOKEN;
if (process.env.PREFIX) config.prefix = process.env.PREFIX;
if (process.env.GUILD_ID) config.Guild = process.env.GUILD_ID;
if (process.env.OWNERS) {
    // Expecting comma-separated IDs in env var: "id1,id2"
    try {
        config.owners = process.env.OWNERS.split(',').map(id => id.trim());
    } catch (e) {
        console.error("Error parsing OWNERS env var:", e);
    }
}
if (process.env.BOT_ID) config.botId = process.env.BOT_ID;

module.exports = config;
