const { MessageAttachment, MessageActionRow, MessageButton } = require('discord.js');
const { createCanvas, loadImage } = require("canvas");
const fetch = require('node-fetch');
const Data = require('pro.db');
const path = require('path');

module.exports = {
  name: 'avatar',
  aliases: ["a"],
  cooldown: 5, // Optional: cooldown in seconds
  run: async (client, message, args) => {
    const isEnabled = Data.get(`command_enabled_${module.exports.name}`);
    if (isEnabled === false) {
      return; 
    }

    let setChannel = Data.get(`setChannel_${message.guild.id}`);
    if (setChannel && message.channel.id !== setChannel) return;

    let user;
    let userId;

    // Determine which user to fetch
    if (message.mentions.users.size > 0) {
      user = message.mentions.users.first();
      userId = user.id;
    } else if (args[0]) {
      userId = args[0].replace(/[<@!>]/g, '');
    } else {
      user = message.author;
      userId = user.id;
    }

    try {
      const response = await fetch(`https://discord.com/api/v9/users/${userId}`, {
        headers: {
          Authorization: `Bot ${client.token}`
        }
      });

      if (!response.ok) {
        return message.reply(' **خطأ: غير قادر على جلب بيانات المستخدم.**');
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
      const guildMember = message.guild.members.cache.get(userId);
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

      const replyMessage = await message.reply({ files: [attachment], components: [actionRow] });

      const filter = (interaction) => interaction.user.id === message.author.id;
      const collector = replyMessage.createMessageComponentCollector({ filter, time: 15000 });

      collector.on('collect', async (interaction) => {
        if (interaction.isButton()) {
          const buttonId = interaction.customId;
          if (buttonId === 'show_banner') {
            if (bannerAvailable) {
              await interaction.reply({ files: [bannerURL], ephemeral: true });
            } else {
              await interaction.reply({ content: '**لا يمُلك بنر.** ❌', ephemeral: true });
            }
          } else if (buttonId === 'show_avatar') {
            if (avatarbotn) {
              await interaction.reply({ files: [avatarbotn], ephemeral: true });
            } else {
              await interaction.reply({ content: '**لا يمُلك افتار.** ❌', ephemeral: true });
            }
          }
        }
      });

      collector.on('end', (collected) => {
        replyMessage.edit({ components: [] }); // Disable buttons after collector ends
      });

    } catch (error) {
      console.error(error);
      message.react("❌");
    }
  }
};