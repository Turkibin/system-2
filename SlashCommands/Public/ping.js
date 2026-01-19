const { CommandInteraction, Client } = require("discord.js");
const Data = require("pro.db");

module.exports = {
    name: "ping",
    description: "Returns the bot's ping",
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        const isEnabled = Data.get(`command_enabled_${module.exports.name}`);
        if (isEnabled === false) {
            return interaction.reply({ content: "This command is disabled.", ephemeral: true });
        }
        interaction.reply({ content: `my ping is **${client.ws.ping}** 🎯` });
    },
};