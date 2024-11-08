const { REST } = require("@discordjs/rest");
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require("discord.js");
const fs = require('fs');
const { token } = require("../base/settings.json")
const clientId = '738716377195610195';

module.exports = (client) => {
    client.handleCommands = async (commandFolders, path) => {
        client.commandArray = [];
        for (let folder of commandFolders) {
            const commandFiles = fs.readdirSync(`${path}/${folder}`).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(`../commands/${folder}/${file}`);

                if (command.data.enable) {
                    client.commands.set(command.data.name, command);

                    if (command.data.aliases) {
                        for (const alias of command.data.aliases) {
                            client.commands.set(alias, command);
                        }
                    }

                    if (command.data.slash) {
                        client.commandArray.push(command.data);

                        if (command.data.aliases) {
                            for (const alias of command.data.aliases) {
                                let aliasCommand = new SlashCommandBuilder()
                                    .setName(alias)
                                    .setDescription(command.data.description);

                                if (command.data.options) {
                                    for (const option of command.data.options) {
                                        switch (option.type) {
                                            case 3:
                                                aliasCommand.addStringOption(opt => opt.setName(option.name).setDescription(option.description).setRequired(option.required));
                                                break;
                                            case 4:
                                                aliasCommand.addIntegerOption(opt => opt.setName(option.name).setDescription(option.description).setRequired(option.required));
                                                break;
                                            case 5:
                                                aliasCommand.addBooleanOption(opt => opt.setName(option.name).setDescription(option.description).setRequired(option.required));
                                                break;
                                            case 6:
                                                aliasCommand.addUserOption(opt => opt.setName(option.name).setDescription(option.description).setRequired(option.required));
                                                break;
                                            case 7:
                                                aliasCommand.addChannelOption(opt => opt.setName(option.name).setDescription(option.description).setRequired(option.required));
                                                break;
                                            case 8:
                                                aliasCommand.addRoleOption(opt => opt.setName(option.name).setDescription(option.description).setRequired(option.required));
                                                break;
                                            case 9:
                                                aliasCommand.addMentionableOption(opt => opt.setName(option.name).setDescription(option.description).setRequired(option.required));
                                                break;
                                            case 10:
                                                aliasCommand.addNumberOption(opt => opt.setName(option.name).setDescription(option.description).setRequired(option.required));
                                                break;
                                            case 11:
                                                aliasCommand.addAttachmentOption(opt => opt.setName(option.name).setDescription(option.description).setRequired(option.required));
                                                break;
                                            default:
                                                console.warn(`Unsupported option type: ${option.type}`);
                                                break;
                                        }
                                    }
                                }

                                // Orijinal komuttaki integration_type ve contexts'i alias komuta ekleyelim
                                const aliasCommandJson = aliasCommand.toJSON();
                                if (command.data.integration_types) {
                                    aliasCommandJson.integration_types = command.data.integration_types;
                                }
                                if (command.data.contexts) {
                                    aliasCommandJson.contexts = command.data.contexts;
                                }

                                client.commandArray.push(aliasCommandJson);
                            }
                        }
                    } else {
                        if (!client.prefixCommands) client.prefixCommands = new Map();
                        client.prefixCommands.set(command.data.name, command);

                        if (command.data.aliases) {
                            for (const alias of command.data.aliases) {
                                client.prefixCommands.set(alias, command);
                            }
                        }
                    }
                }
            }
        }

        const rest = new REST({ version: '9' }).setToken(token);

        (async () => {
            try {
                console.log('Komutlar yükleniyor...');

                await rest.put(
                    Routes.applicationCommands(clientId),
                    { body: client.commandArray }
                );

                console.log('Başarıyla yüklendi ✅');
            } catch (error) {
                console.error(error);
            }
        })();
    };
};
