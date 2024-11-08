const { EmbedBuilder } = require("discord.js");
const {QuickDB} = require('quick.db');
const db = new QuickDB();

module.exports = {
 data: {
  slash: true,
  enable: true,
  name: "songörülme",
  description: "Bir kişinin en son ne zaman aktif olduğunu gösterir",
  options: [
    {
      name: "kişi",
      description: "En son ne zaman aktif olduğunu öğrenmek istediğiniz kişiyi seçin",
      type: 6,
      required: true,
    },
  ],
  },
  async execute(interaction, client) {
    if (interaction.guild.id !== "1083453606801453126") return await interaction.reply({content:'Bu sunucuda kullanamazsın', ephemeral:true});
    const kişi = interaction.options.getUser("kişi");
        if (kişi.bot) return interaction.reply({
        content: "Botlar olmaz",
        ephemeral: true,
      });
    if (kişi === interaction.user)
      return interaction.reply({
        content: "Çok mu yalnızsın 😭",
        ephemeral: true,
      });
    const member = await interaction.guild.members.fetch(kişi);
    const userPresence = member.presence;
    const status = userPresence?.status || "offline";
    if (status !== "offline")
      return interaction.reply({
        content: `${kişi} zaten aktif 🗿`,
        ephemeral: true,
      });
    const kişizaman = await db.get(`offlineTime_${kişi.id}`) || "Tespit edilemedi";
    const kişitimestamp = await db.get(`offlineTimestamp_${kişi.id}`) || "_ _";


    const embed = new EmbedBuilder()
      .addFields({
        name: `${kişi.username} adlı kişinin son görülme tarihi`,
        value: `\`\`\`${kişizaman}\`\`\`\ \n${kişitimestamp}`,
      })

      .setThumbnail(kişi.displayAvatarURL())
      .setColor("#FFFFFF")
    await interaction.reply({ embeds: [embed] });
  },
};
