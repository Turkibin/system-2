const Data = require("pro.db");

module.exports = async (client) => {
    console.table({
        Name: client.user.tag,
        Ping: client.ws.ping,
        Prefix: client.prefix,
        ID: client.user.id,
        Server: client.guilds.cache.size,
        Members: client.users.cache.size,
        Channels: client.channels.cache.size,
        Developer: " Abdulelah"
    });

console.log(`
    
                                                                                                                                                                      
                                                                                                                                                                  
                        ▄▄   ▄▄                                                            
▀████▀   ▀███▀        ▀███   ██               ███▀▀██▀▀███                                 
  ▀██     ▄█            ██                    █▀   ██   ▀█                                 
   ██▄   ▄█    ▄▄█▀██   ██ ▀███ ▀██▀   ▀██▀        ██      ▄▄█▀██ ▄█▀██▄ ▀████████▄█████▄  
    ██▄  █▀   ▄█▀   ██  ██   ██   ▀██ ▄█▀          ██     ▄█▀   ███   ██   ██    ██    ██  
    ▀██ █▀    ██▀▀▀▀▀▀  ██   ██     ███            ██     ██▀▀▀▀▀▀▄█████   ██    ██    ██  
     ▄██▄     ██▄    ▄  ██   ██   ▄█▀ ██▄          ██     ██▄    ▄█   ██   ██    ██    ██  
      ██       ▀█████▀▄████▄████▄██▄   ▄██▄      ▄████▄    ▀█████▀████▀██▄████  ████  ████▄
                                                                                           
                                                                                           
                                                                                                                                              
                                                                                                                                                                  
        
             🌐 Website: https://velix.team
            ⚡ Discord: https://discord.gg/7-7

    `)

    client.commands.forEach(command => {
        const aliases = Data.get(`aliases_${command.name}`);
        if (aliases) {  
            command.aliases = aliases;
            client.commands.set(command.name, command);
        }
    });

    if (client.slashArray && client.slashArray.length > 0) {
        console.log(`⏳ Registering Slash Commands...`);
        
        // Register Globally
        client.application.commands.set(client.slashArray)
            .then(() => console.log('✅ Registered Slash Commands Globally'))
            .catch(e => console.error('❌ Failed to register commands globally:', e));

        // Register for each guild (instant)
        client.guilds.cache.forEach(guild => {
            guild.commands.set(client.slashArray)
                .then(() => console.log(`✅ Registered Slash Commands for guild: ${guild.name} (${guild.id})`))
                .catch(e => console.error(`❌ Failed to register commands for ${guild.name}:`, e));
        });
    }
};
