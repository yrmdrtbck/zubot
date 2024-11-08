
const { Partials, GatewayIntentBits, discord, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, Client } = require("discord.js");
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const moment = require("moment");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const axios = require("axios")
const client = new Client({
  intents: Object.values(GatewayIntentBits).filter(
    (x) => typeof x === "string"
  ),
  partials: Object.values(Partials).filter((x) => typeof x === "string"),
});
const { prefix } = require("../../base/settings.json");

module.exports = {
  data: {
    slash: false,
    enable: true,
    name: "eval",
  },
  async execute(message, client) {
    if (
      message.author.id !== "1049295355881205850" && // ferristik
      message.author.id !== "968507369715802162" && // asdr
      message.author.id !== "676101841133764633" && // yirmidortbucuk
      message.author.id !== "691978032097001483" // yomaga
    )
      return message.channel.send("Bu komutu sen kullanamazsın :x:");
    try {
      var code = await message.content.substring(prefix.length + 5);

      // console.log çıktısını yakalamak için geçici bir değişken oluştur
      let logOutput = "";
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        logOutput += args.join(" ") + "\n";
        originalConsoleLog(...args);
      };

      // Eval edilen kodun async olarak çalışmasını sağla
      let evaled;
      if (code.includes("await")) {
        evaled = await eval(`(async () => { ${code} })()`);
      } else {
        evaled = await eval(code);
      }

      // console.log'u eski haline getir
      console.log = originalConsoleLog;

      if (typeof evaled !== "string") evaled = require("util").inspect(evaled);

      let Embed = new EmbedBuilder()
        .addFields({ name: "Giriş", value: "```js\n" + code + "```" })
        .setDescription("```js\n" + clean(evaled) + "```")
        .addFields({ name: "Log Çıktısı", value: "```\n" + logOutput + "```" });

      if (Embed.description && Embed.description.length >= 2048) {
        Embed.description = Embed.description.substr(0, 2042) + "...";
      }
      return await message.channel.send({ content: `Başarılı`, embeds: [Embed] });
    } catch (err) {
      await message.channel.send(`\`HATA\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
    function clean(text) {
      if (typeof text === "string")
        return text
          .replace(/`/g, "`" + String.fromCharCode(8203))
          .replace(/@/g, "@" + String.fromCharCode(8203));
      else return text;
    }
  },
};