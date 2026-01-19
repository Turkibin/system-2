
const { Client, intents, Collection, MessageEmbed, MessageAttachment, MessageActionRow, MessageButton, MessageSelectMenu, WebhookClient, MessageModal, Role, Modal, TextInputComponent } = require("discord.js");
const db = require("pro.db");



module.exports = async (client, interaction) => {
    if (interaction.isCommand()) {
        const cmd = client.slashCommands.get(interaction.commandName);
        if (!cmd) return;

        const args = [];

        for (let option of interaction.options.data) {
            if (option.type === "SUB_COMMAND") {
                if (option.name) args.push(option.name);
                option.options?.forEach((x) => {
                    if (x.value) args.push(x.value);
                });
            } else if (option.value) args.push(option.value);
        }
        interaction.member = interaction.guild.members.cache.get(interaction.user.id);

        try {
            await cmd.run(client, interaction, args);
        } catch (error) {
            console.error(`Error executing command ${interaction.commandName}:`, error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'حدث خطأ أثناء تنفيذ هذا الأمر!', ephemeral: true }).catch(() => {});
            } else {
                await interaction.reply({ content: 'حدث خطأ أثناء تنفيذ هذا الأمر!', ephemeral: true }).catch(() => {});
            }
        }
    }

    if (interaction.isContextMenu()) {
        const command = client.slashCommands.get(interaction.commandName);
        if (command) {
            try {
                await command.run(client, interaction);
            } catch (error) {
                console.error(`Error executing context menu ${interaction.commandName}:`, error);
            }
        }
    }

    if (interaction.isButton()) {
        if (interaction.customId === `Auto_Reply`) {
            const { Modal, TextInputComponent } = require("discord.js");
            const Services = new Modal().setCustomId(`Reply-Bot`).setTitle(`Reply`);
            const Service_1 = new TextInputComponent().setCustomId('Auto-Reply').setLabel(`اضف الرسالة الذي سوف يرد عليها البوت`).setStyle(`PARAGRAPH`).setPlaceholder(' ').setRequired(true)
            const Service_2 = new TextInputComponent().setCustomId('-Reply').setLabel(`إضف الرد هنا`).setStyle(`PARAGRAPH`).setPlaceholder(' ').setRequired(true)
            const Service1 = new MessageActionRow().addComponents(Service_1);
            const Service2 = new MessageActionRow().addComponents(Service_2);
            Services.addComponents(Service1, Service2);
            interaction.showModal(Services);
        }
    }
    if (interaction.isModalSubmit()) {
        if (interaction.customId === `Reply-Bot`) {
            const Service_1 = interaction.fields.getTextInputValue('Auto-Reply');
            const Service_2 = interaction.fields.getTextInputValue('-Reply');
            if (db.get(`Replys_${Service_1}`)) return interaction.reply({ content: `موجود بالفعل`, ephemeral: true })
            db.push(`Replys_${Service_1}`, { Word: Service_1, Reply: Service_2 })
            interaction.reply({ content: `${Service_1} | ${Service_2}`, ephemeral: true })
        }
    }
}
