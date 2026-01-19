const { CommandInteraction, Client, MessageAttachment, MessageActionRow, MessageButton } = require('discord.js');
const { createCanvas, loadImage } = require("canvas");
const fetch = require('node-fetch');
const Data = require('pro.db');
const path = require('path');

module.exports = {
  name: 'avatar',
  description: 'Displays user avatar and banner',
  options: [
    {
      name: 'user',
      description: 'The user to display avatar for',
      type: 'USER',
      required: false
    }
  ],
  /**
   * @param {Client} client 
   * @param {CommandInteraction} interaction 
   */
  run: async (client, interaction, args) => {
    const isEnabled = Data.get(`command_enabled_${module.exports.name}`);
    if (isEnabled === false) {
      return interaction.reply({ content: "This command is disabled.", ephemeral: true });
    }

    let setChannel = Data.get(`setChannel_${interaction.guild.id}`);
    if (setChannel && interaction.channel.id !== setChannel) {
        return interaction.reply({ content: `This command can only be used in <#${setChannel}>`, ephemeral: true });
    }

    await interaction.deferReply();

    const user = interaction.options.getUser('user') || interaction.user;
    const userId = user.id;

    try {
      const response = await fetch(`https://discord.com/api/v9/users/${userId}`, {
        headers: {
          Authorization: `Bot ${client.token}`
        }
      });

      if (!response.ok) {
        return interaction.followUp(' **خطأ: غير قادر على جلب بيانات المستخدم.**');
      }

      const userData = await response.json();
      const avatarURL = userData.avatar
        ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
        : `https://cdn.discordapp.com/embed/avatars/${userData.discriminator % 5}.png`;

      const fetchedUserData = await client.users.fetch(userId);
      const avatarbotn = fetchedUserData.displayAvatarURL({ dynamic: true, format: 'png', size: 512 });

      // Check for banner availability
      let bannerAvailable = false;
      let bannerURL = null;
      if (userData.banner) {
        bannerURL = `https://cdn.discordapp.com/banners/${userData.id}/${userData.banner}.png?size=1024`;
        bannerAvailable = true;
      }

      // Initialize Canvas
      const canvas = createCanvas(350, 220);
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 350, 220);

      // Add background image
      const backgroundImage = await loadImage(path.resolve('./Fonts/Badges.png'));
      ctx.drawImage(backgroundImage, 0, 0, 350, 220);

      if (bannerAvailable && bannerURL) {
        try {
            const bannerImage = await loadImage(bannerURL);
            ctx.drawImage(bannerImage, 0, 0, 350, 110);
        } catch(e) {
            ctx.fillStyle = '#2e3035';
            ctx.fillRect(0, 0, 350, 110);
        }
      } else {
        ctx.fillStyle = '#2e3035';
        ctx.fillRect(0, 0, 350, 110); // Fallback color if no banner
      }

      const avatarImage = await loadImage(avatarURL);
      
      // Black circle background
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(70, 110, 53, 0, Math.PI * 2);
      ctx.fill();

      // Avatar
      ctx.save();
      ctx.beginPath();
      ctx.arc(70, 110, 45, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatarImage, 70 - 45, 110 - 45, 90, 90);
      ctx.restore();

      // Status circles
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(100, 142, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#00f000';
      ctx.beginPath();
      ctx.arc(100, 142, 10, 0, Math.PI * 2);
      ctx.fill();

      // User info on canvas
      const guildMember = interaction.guild.members.cache.get(userId);
      const displayName = guildMember && guildMember.nickname ? guildMember.nickname : userData.username;

      ctx.fillStyle = '#ffffff';
      ctx.font = '19px Cairo'; // Assuming font is registered globally in main file
      ctx.textAlign = 'left';
      ctx.fillText(`@${displayName}`, 15, 178);
      
      const attachment = new MessageAttachment(canvas.toBuffer(), 'avatar.png');

      const bannerButton = new MessageButton()
        .setLabel('Banner')
        .setStyle('PRIMARY')
        .setCustomId('show_banner')
        .setDisabled(!bannerAvailable); // Disable if no banner

      const avatarButton = new MessageButton()
        .setLabel('Avatar')
        .setStyle('PRIMARY')
        .setCustomId('show_avatar')
        .setDisabled(!avatarbotn); // Disable if no avatar

      const profileLinkButton = new MessageButton()
        .setLabel('Profile Link')
        .setStyle('LINK')
        .setURL(`https://discord.com/users/${userId}`); // Profile link button

      const actionRow = new MessageActionRow()
        .addComponents(bannerButton, avatarButton, profileLinkButton);

      const replyMessage = await interaction.followUp({ files: [attachment], components: [actionRow] });

      const filter = (i) => i.user.id === interaction.user.id;
      const collector = replyMessage.createMessageComponentCollector({ filter, time: 15000 });

      collector.on('collect', async (i) => {
        if (i.isButton()) {
          const buttonId = i.customId;
          if (buttonId === 'show_banner') {
            if (bannerAvailable) {
              await i.reply({ files: [bannerURL], ephemeral: true });
            } else {
              await i.reply({ content: '**لا يمُلك بنر.** ❌', ephemeral: true });
            }
          } else if (buttonId === 'show_avatar') {
            if (avatarbotn) {
              await i.reply({ files: [avatarbotn], ephemeral: true });
            } else {
              await i.reply({ content: '**لا يمُلك افتار.** ❌', ephemeral: true });
            }
          }
        }
      });

      collector.on('end', (collected) => {
        replyMessage.edit({ components: [] }); // Disable buttons after collector ends
      });

    } catch (error) {
      console.error(error);
      interaction.followUp("❌ An error occurred");
    }
  }
};