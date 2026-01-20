const { 
  Client, 
  Collection, 
  MessageEmbed,
  MessageSelectMenu,
  MessageActionRow,
  } = require("discord.js");
  const express = require('express');
  const app = express();
  const port = process.env.PORT || 3000;

  app.get('/', (req, res) => {
    res.send('Bot is running!');
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
  });

  console.log("🚀 Starting Bot...");

process.on('unhandledRejection', error => {
    console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('Uncaught Exception:', error);
});

const client = new Client({ 
    intents: 32767,
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

client.on('error', error => {
    console.error('Discord Client Error:', error);
});

client.on('warn', info => {
    console.log('Discord Client Warning:', info);
});



const Discord = require('discord.js');
const dbq = require("pro.db");
const db = require("pro.db");
const moment = require('moment');
const fs = require("fs");
const { exec } = require('child_process'); 
const ms = require(`ms`);
const { prefix, owners, Guild } = require(`${process.cwd()}/config`);
const config = require(`${process.cwd()}/config`);
const Data = require("pro.db");

client.commands = new Collection();
module.exports = client;

client.commands = new Collection();
client.config = require(`${process.cwd()}/config`);
try {
    require("./handler")(client);
} catch (error) {
    console.error("❌ Handler initialization failed:", error);
}
client.prefix = prefix;
client.login(config.token).then(() => {
    console.log("✅ Successfully logged into Discord!");
  }).catch(err => {
    console.error("❌ Login failed:", err.message);
    if (err.message.includes("TOKEN_INVALID")) {
      console.error("👉 TIP: Make sure you have set the TOKEN variable in Railway Settings > Variables");
    }
  });

// Keep process alive
setInterval(() => {}, 60000);
  



  const registeredEvents = new Set();
  
  fs.readdir(`${__dirname}/events/`, (err, folders) => {
      if (err) return console.error(err);
  
      folders.forEach(folder => {
          if (folder.includes('.')) return;
  
          fs.readdir(`${__dirname}/events/${folder}`, (err, files) => {
              if (err) return console.error(err);
  
              files.forEach(file => {
                  if (!file.endsWith('.js')) return;
  
                  let eventName = file.split('.')[0];
                  // Normalize event name casing
                  if (eventName.toLowerCase() === 'interactioncreate') eventName = 'interactionCreate';
                  if (eventName.toLowerCase() === 'messagecreate') eventName = 'messageCreate';
                  if (eventName.toLowerCase() === 'guildmemberadd') eventName = 'guildMemberAdd';
                  if (eventName.toLowerCase() === 'guildmemberremove') eventName = 'guildMemberRemove';
                  
                  let eventPath = `${__dirname}/events/${folder}/${file}`;
                  
                  // Avoid registering the same event from multiple files if they are empty polyfills
                  try {
                      let event = require(eventPath);
                      if (typeof event === 'function') {
                          // Check if function is empty (just a placeholder)
                          const isPlaceholder = event.toString().replace(/\s/g, '').includes('=>{}');
                          if (!isPlaceholder) {
                            client.on(eventName, event.bind(null, client));
                            console.log(`✅ Loaded event: ${eventName} from ${folder}/${file}`);
                          } else {
                            console.log(`ℹ️ Skipping placeholder event: ${eventName} from ${folder}/${file}`);
                          }
                      }
                  } catch (error) {
                      console.error(`❌ Failed to load event ${file}:`, error);
                  }
              });
          });
      });
  });

  client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    const firstGuild = client.guilds.cache.first();
    if (firstGuild) {
      // استرجاع الحالة المحفوظة من قاعدة البيانات
      let savedStatus = db.get(`${firstGuild.id}_status`); // الحصول على الحالة المحفوظة باستخدام معرف السيرفر
      
      // إذا لم تكن هناك حالة محفوظة، استخدم الحالة الافتراضية
      let statusMessage = savedStatus ? savedStatus : "hawk";
    } else {
      console.log("Bot is not in any guild yet.");
    }
    
  });
