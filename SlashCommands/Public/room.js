module.exports = {
    name: "disabled_room",
    description: "This command is disabled.",
    run: async (client, interaction) => {
        return interaction.reply({ content: "هذا النظام تم إلغاؤه بناءً على طلب المالك.", ephemeral: true });
    }
};
