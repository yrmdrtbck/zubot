const { EmbedBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
  data: {
    slash: true,
    enable: true,
    name: "snipe",
    description: "Son silinen mesajları gör",
    options: [
      {
        name: "sayı",
        description: "Snipe atmak istediğin mesaj sayısını gir",
        type: 4,
        required: true,
      },
    ],
  },
  async execute(interaction, client) {
    if (interaction.user.username !== 'asdr') return await interaction.reply({content:'Bu komut düzgün çalışmadığı için bakımdadır', ephemeral:true})
    //if (interaction.guild.id !== "1083453606801453126") return await interaction.reply({content:'Bu sunucuda kullanamazsın', ephemeral:true});
    const sayı = interaction.options.getInteger("sayı");
    if (sayı > 10)
      return await interaction.reply({
        content: "En fazla 10 mesaj görüntülenebilir",
        ephemeral: true,
      });
    if (sayı < 1)
      return await interaction.reply({
        content: "En az 1 mesaj görüntülenebilir",
        ephemeral: true,
      });
    const snipedMessages = await db.get(`snipe_${interaction.guild.id}`);
    if (!snipedMessages) return await interaction.reply({content:'Daha önce hiç mesaj silinmemiş', ephemeral:true})
    let snipes = snipedMessages.slice(-sayı);
    let snipeField = [];
    let attachmentString = "";
    await Promise.all(
      snipes.map(async (snipe) => {
      if (snipe.type === 'DELETED') {
        if (snipe.attachments === null) {
          snipeField.push({
            name: '<:deleted:1277232257958023219> Silinen Mesaj - ' + snipe.author,
            value: `-# **Mesaj:** ${snipe.content}\n-# **Silinme Zamanı:** <t:${snipe.timestamp}:R>`,
          });
        } else {
          let attachmentString = "";
          const snipeAttachments = snipe.attachments;

          await Promise.all(
            snipeAttachments.map(async (id) => {
              const mesaj = await client.channels.cache
                .get("1276948217510232147")
                .messages.fetch(id);
              const link = mesaj.attachments.first().url;
              attachmentString += `${link}\n`;
            })
          );

          snipeField.push({
            name: '<:deleted:1277232257958023219> Silinen Mesaj - ' + snipe.author,
            value: `-# **Mesaj:** ${snipe.content}\n-# **Dosya(lar):** ${attachmentString}-# **Silinme Zamanı:** <t:${snipe.timestamp}:R>`,
          });
        }
      } else if (snipe.type === 'EDITED') {
          if (snipe.attachments === null) {
          snipeField.push({
            name: '<:edited:1277235105915605094> Düzenlenen Mesaj - ' + snipe.author,
            value: `-# **Eski Mesaj:** ${snipe.content}\n-# **Düzenlenme Zamanı:** <t:${snipe.timestamp}:R>\n-# [Mesaja gitmek için tıklayın](https://discord.com/channels/${interaction.guild.id}/${snipe.channelId}/${snipe.messageId})`,
          });
        } else {
          let attachmentString = "";
          const snipeAttachments = snipe.attachments;

          await Promise.all(
            snipeAttachments.map(async (id) => {
              const mesaj = await client.channels.cache
                .get("1276948217510232147")
                .messages.fetch(id);
              const link = mesaj.attachments.first().url;
              attachmentString += `${link}\n`;
            })
          );

          snipeField.push({
            name: '<:edited:1277235105915605094> Düzenlenen Mesaj - ' + snipe.author,
            value: `-# **Eski Mesaj:** ${snipe.content}\n-# **Dosya(lar):** ${attachmentString}-# **Düzenlenme Zamanı:** <t:${snipe.timestamp}:R>\n-# [Mesaja gitmek için tıklayın](https://discord.com/channels/${interaction.guild.id}/${snipe.channelId}/${snipe.messageId})`,
          });
        }
      }
    })
    );
    const snipeEmbed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("Sniped")
      .addFields(snipeField);
    await interaction.reply({ embeds: [snipeEmbed] });
  },
};
