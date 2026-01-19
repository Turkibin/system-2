const { Client, intents, Collection, MessageEmbed, MessageAttachment, MessageActionRow, MessageButton, MessageSelectMenu, WebhookClient, MessageModal, Role, Modal, TextInputComponent } = require("discord.js");
const { createCanvas, registerFont, loadImage } = require("canvas");
const Data = require("pro.db");
const Discord = require('discord.js');
const axios = require('axios');
const path = require('path');

// Register font (only needs to be done once)
try {
    registerFont(path.resolve('./Fonts/JF-Flat-Regular.ttf'), { family: 'Cairo' });
} catch (e) {
    console.error('Failed to register font:', e);
}

module.exports = async (client, message) => {
    if (!message.guild || message.author.bot) return;

    // --- Command Handler ---
    if (message.content.toLowerCase().startsWith(client.config.prefix)) {
        const [cmd, ...args] = message.content
            .slice(client.config.prefix.length)
            .trim()
            .split(/ +/g);

        const command = client.commands.get(cmd.toLowerCase()) || client.commands.find(c => c.aliases?.includes(cmd.toLowerCase()));

        if (command) {
            try {
                await command.run(client, message, args);
            } catch (error) {
                console.error(`Error running command ${cmd}:`, error);
            }
            return;
        }

        // Special handling for restart command
        if (cmd === 'restart') {
            if (!client.config.owners.includes(message.author.id)) return message.react('❌');
            
            message.reply('جاري إعادة تشغيل البوت...').then(() => {
                console.log('إيقاف البوت لإعادة التشغيل...');
                client.destroy();
                setTimeout(() => {
                    client.login(client.config.token);
                }, 3000);
            });
            return;
        }
    }

    // --- Other Logic (Points, Images, etc.) ---
    const reactData = Data.get(`RoomInfo_${message.channel.id}`);
    if (reactData) {
        const channel = message.guild.channels.cache.get(reactData.Channel_Id);
        if (channel) {
            const emoji1 = reactData.Emoji1_Id || await client.emojis.cache.find(emoji => emoji.id === reactData.Emoji1_Id);
            const emoji2 = reactData.Emoji2_Id || await client.emojis.cache.find(emoji => emoji.id === reactData.Emoji2_Id);
            const emoji3 = reactData.Emoji3_Id || await client.emojis.cache.find(emoji => emoji.id === reactData.Emoji3_Id);
            const emoji4 = reactData.Emoji4_Id || await client.emojis.cache.find(emoji => emoji.id === reactData.Emoji4_Id);
            const emoji5 = reactData.Emoji5_Id || await client.emojis.cache.find(emoji => emoji.id === reactData.Emoji5_Id);
            const emoji6 = reactData.Emoji6_Id || await client.emojis.cache.find(emoji => emoji.id === reactData.Emoji6_Id);

            if (emoji1) await message.react(emoji1);
            if (emoji2) await message.react(emoji2);
            if (emoji3) await message.react(emoji3);
            if (emoji4) await message.react(emoji4);
            if (emoji5) await message.react(emoji5);
            if (emoji6) await message.react(emoji6);
        }
    }

    const Word = Data.get(`Replys_${message.content}`);
    if (Word && message.content.startsWith(Word[0].Word)) {
        message.channel.send({ content: `${Word[0].Reply}` });
    }

    // Check points and increase them
    const userId = message.author.id;
    const pointsEnabled = Data.get(`levels-${message.guild.id}`);
    if (pointsEnabled) {
        // Fetch message count for the user
        let userMessageCount = (await Data.fetch(`${userId}_messageCount`)) || 0;

        if (!message.author.bot) {
            userMessageCount++; // Increment the message count

            // Grant 1 point for each message
            let userPoints = (await Data.fetch(`${userId}_points`)) || 0;
            await Data.set(`${userId}_points`, userPoints + 1); // Increment by 1

            // Update message count
            await Data.set(`${userId}_messageCount`, userMessageCount);
        }
    }

    // حذف الرسائل في القنوات المحددة
    if (!message.author.bot && message.content) {
        const channels = Data.get(`setChannels_${message.guild.id}`) || [];
        if (channels.includes(message.channel.id)) {
            if (message.attachments.size === 0) {
                message.delete().catch(console.error);
            }
        }
    }

    // التعديل على الصور
    const storedChannels = await Data.get("Channels") || [];
    for (const entry of storedChannels) {
        if (entry.channelID === message.channel.id) {
            if (entry.fontURL) {
                await message.channel.send({ files: [{ attachment: entry.fontURL, name: 'Quill.png' }] });
            }
        }
    }

    if (message.channel.id === Data.get(`setevaluation_${message.guild.id}`)) {
        try {
            let imageURL = Data.get(`setImageURL_${message.guild.id}`);
            let textColor = Data.get(`textColor_${message.guild.id}`) || '#ffffff'; // Default color if not set

            async function generateCanvas() {
                let content = message.content;
                content = content.replace(/<@!?\d+>/g, '');
                let contentArr = [];
                while (content.length > 75) {
                    contentArr.push(content.slice(0, 75));
                    content = content.slice(75);
                }
                contentArr.push(content);

                const canvas = createCanvas(914, 316);
                const ctx = canvas.getContext('2d');

                // Draw background
                const bg = await loadImage(imageURL);
                ctx.drawImage(bg, 0, 0, 914, 316);

                // Draw avatar
                ctx.save();
                ctx.beginPath();
                ctx.arc(755.80 + 35.80/2, 258 + 35.80/2, 35.80/2, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.clip();
                const avatar = await loadImage((message.author.avatarURL() + ``).replace(`.webp`, `.png`).replace(`.gif`, `.png`));
                ctx.drawImage(avatar, 755.80, 258, 35.80, 35.80);
                ctx.restore();

                // Draw text
                ctx.textAlign = 'right';
                ctx.fillStyle = textColor;
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 8;
                ctx.font = 'bold 20px Cairo';
                ctx.fillText(contentArr.join('\n'), 770, 125);

                ctx.fillStyle = textColor;
                ctx.textAlign = 'right';
                ctx.font = 'bold 30px Cairo';
                ctx.fillText(message.member.displayName, 710, 270);

                return canvas.toBuffer();
            }

            let balancCanvas = await generateCanvas();
            await message.channel.send({ files: [balancCanvas] });
            await message.delete().catch(() => {});
        } catch (error) {
            console.error(error);
            return;
        }
    } else {
        // (rest of your code continues)

        const imageStatus = await Data.get(`ImageStatus_${message.guild.id}`) || "on"; // الحالة الافتراضية هي تشغيل
        let image = null; // تحديد متغير لتخزين حالة الصورة داخل الامبيد  
        image = Data.get("Line");
        const ChannelData = Data.get(`avtchats-[${message.guild.id}]`);
        const Color = await Data.get(`Guild_Color-${message.guild.id}`) || '#fefeff';
        
        if (!Color || !ChannelData || message.author.bot || !ChannelData.includes(message.channel.id)) {
            return;
        }
        
        let imageUrls = [];
        let isImage = false;
        let isVideo = false;
        
        if (message.attachments.size > 0) {
            message.attachments.forEach(attachment => {
                const imageUrl = attachment.url;
                const isImageAttachment = attachment.contentType.startsWith('image/');
                const isVideoAttachment = attachment.contentType.startsWith('video/');
        
                if (isImageAttachment || isVideoAttachment) {
                    imageUrls.push({ url: imageUrl, isImage: isImageAttachment, isVideo: isVideoAttachment });
                }
            });
        }
        
        const content = message.content.trim();
        if (content.startsWith('http') && (content.endsWith('.png') || content.endsWith('.jpg') || content.endsWith('.gif'))) {
            imageUrls.push({ url: content, isImage: true, isVideo: false });
        }
        
        if (imageUrls.length === 0) {
            return;
        }
        
        for (const imageUrlData of imageUrls) {
            const { url, isImage, isVideo } = imageUrlData;
        
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data, 'binary');
        
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setLabel('تحميل')
                        .setStyle('LINK')
                        .setURL(url)
                );
        
            const embed = new MessageEmbed()
                .setColor(Color)
                .setImage('attachment://image.png');
        
            if (image && imageStatus === "on") {
                await message.channel.send({
                    embeds: [embed],
                    files: [{
                        attachment: imageBuffer,
                        name: 'image.png'
                    }],
                    components: [row]
                });
            } else {
                await message.channel.send({
                    files: [{
                        attachment: imageBuffer,
                        name: 'image.png'
                    }],
                    components: [row]
                });
            }
        }
        if (image) {
            await message.channel.send({ files: [image] });
        }
        
        await message.delete();
    }
};