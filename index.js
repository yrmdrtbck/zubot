const {
  Collection,
  AuditLogEvent,
  ActivityType,
  EmbedBuilder,
  Client,
  GatewayIntentBits,
  Events,
  Partials,
  AttachmentBuilder,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const ax = require("axios");
const moment = require("moment");
require("moment/locale/tr");

const client = new Client({
  intents: Object.values(GatewayIntentBits).filter(
    (x) => typeof x === "string"
  ),
  partials: Object.values(Partials).filter((x) => typeof x === "string"),
});
const { token } = require("./src/base/settings.json");
const { Cron } = require("croner");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
client.commands = new Collection();
const functions = fs
  .readdirSync("./src/functions")
  .filter((file) => file.endsWith(".js"));
const eventFiles = fs
  .readdirSync("./src/events")
  .filter((file) => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
  for (let file of functions) {
    require(`./src/functions/${file}`)(client);
  }
  client.handleCommands(commandFolders, "./src/commands");
  client.handleEvents(eventFiles, "./src/events");
  client.login(token);
})();

client.on("guildCreate", async (guild) => {
  if (guild.id !== "1083453606801453126") {
    await guild.leave();
    console.log(
      `Bot left guild ${guild.name} (${guild.id}) because it's not the specified guild.`
    );
  }
});

//SON GÖRÜLME
client.on("presenceUpdate", (oldPresence, newPresence) => {
  if (!newPresence?.member || !oldPresence?.member) return;
  if (newPresence.member.user.bot || oldPresence.member.user.bot) return;
  const user = newPresence.member.user;
  if (
    newPresence.status === "offline" &&
    oldPresence.status !== "offline" &&
    newPresence.guild.id === "1083453606801453126"
  ) {
    const formattedDate = moment()
      .add(3, "hours")
      .locale("tr")
      .format("DD MMMM dddd HH.mm");
    const timestamp = moment().unix();

    db.set(`offlineTime_${user.id}`, formattedDate);
    db.set(`offlineTimestamp_${user.id}`, `<t:${timestamp}:R>`);
  }
});

//SNIPE
client.on("messageDelete", async (message) => {
  if (message.partial) await message.fetch();
  if (message.author.bot) return;
  if (message.channel.id === "1269402201705545848") return;
  if (message.content.length > 500) return;
  const fetchedLogs = await message.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.MessageDelete,
  });

  const deletionLog = fetchedLogs.entries.first();
  const { executor } = deletionLog;
  const attachments = message.attachments.map((attachment) => attachment.url);
  let attachmentMessageIds = [];

  if (attachments.length > 0) {
    const targetChannel = client.channels.cache.get("1276948217510232147");

    for (const attachment of attachments) {
      const sentMessage = await targetChannel.send({ files: [attachment] });
      attachmentMessageIds.push(sentMessage.id);
    }
  }

  const snipeData = {
    content: message.content || "Yalnızca Dosya Mevcut",
    author: message.author.username,
    timestamp: Math.floor(message.createdTimestamp / 1000),
    deleter: executor.username,
    attachments: attachmentMessageIds.length > 0 ? attachmentMessageIds : null,
    type: "DELETED",
  };
  let snipes = (await db.get(`snipe_${message.guild.id}`)) || [];
  snipes.push(snipeData);

  if (snipes.length > 10) {
    snipes.shift();
  }

  await db.set(`snipe_${message.guild.id}`, snipes);
});

client.on("messageUpdate", async (oldMessage, message) => {
  if (message.partial) return;
  if (message.author.bot) return;
  if (message.content.length > 500) return;
  if (
    (await oldMessage.attachments.size) === (await message.attachments.size) &&
    (await message.content) === (await oldMessage.content)
  )
    return;
  let snipes = (await db.get(`snipe_${message.guild.id}`)) || [];
  const attachments = oldMessage.attachments.map(
    (attachment) => attachment.url
  );

  let attachmentMessageIds = [];

  if (attachments.length > 0) {
    const targetChannel = client.channels.cache.get("1276948217510232147");

    for (const attachment of attachments) {
      const sentMessage = await targetChannel.send({ files: [attachment] });
      attachmentMessageIds.push(sentMessage.id);
    }
  }
  const snipeData = {
    content: oldMessage.content || "Yalnızca Dosya Mevcuttu",
    author: message.author.username,
    timestamp: Math.floor(message.createdTimestamp / 1000),
    attachments: attachmentMessageIds.length > 0 ? attachmentMessageIds : null,
    type: "EDITED",
    messageId: message.id,
    channelId: message.channel.id,
  };

  snipes.push(snipeData);

  if (snipes.length > 10) {
    snipes.shift();
  }
  await db.set(`snipe_${message.guild.id}`, snipes);
});
