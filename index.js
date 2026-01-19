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

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  console.log("🚀 Starting Bot...");

process.on('unhandledRejection', error => {
    console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('Uncaught Exception:', error);
});

const client = new Client({ intents: 32767 });



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
client.login(config.token).catch(err => console.error("Login failed:", err));

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
                  
                  let eventPath = `${__dirname}/events/${folder}/${file}`;
  
                  try {
                      let event = require(eventPath);
                      if (typeof event === 'function') {
                          client.on(eventName, event.bind(null, client));
                          console.log(`✅ Loaded event: ${eventName} from ${folder}/${file}`);
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
