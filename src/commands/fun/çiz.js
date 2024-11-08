let cooldown = 0;
setInterval(() => {
  if (cooldown > 0) {
    cooldown--;
  }
}, 1000);

module.exports = {
  data: {
    slash: true,
    enable: true,
    name: "çiz",
    description: "Yapay zeka isteğinize göre bir çizim yapar.",
    integration_types: [0, 1],
    contexts: [0, 1, 2],
    options: [
      {
        name: "girdi",
        description: "NOT: İNGİLİZCE OLMALI!",
        type: 3,
        required: true,
      },
    ],
  },
  async execute(interaction, client) {
    const {
      EmbedBuilder,
      ButtonBuilder,
      ActionRowBuilder,
      ButtonStyle,
    } = require("discord.js");
    const içerik = interaction.options.getString("girdi");
    const axios = require("axios").default;
    const { QuickDB } = require("quick.db");
    const db = new QuickDB();
    if ((await cooldown) > 0)
      return await interaction.reply({
        content: `Bu komut yakın zamanda kullanılmış, lütfen **${cooldown}** saniye sonra tekrar dene.`,
        ephemeral: true,
      });
    const options = {
      method: "POST",
      url: "https://api.edenai.run/v2/image/generation",
      headers: {
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMmQxMDNiMmQtOTVkZC00NjUwLWFkMjktNjg5NTBhOWI3MzRkIiwidHlwZSI6ImFwaV90b2tlbiJ9.AIw36oom2fcS1MTdcRxr5l_AkoE2hxF76xDD32Iyp20",
      },
      data: {
        providers: "replicate",
        text: içerik,
        resolution: "512x512",
        fallback_providers: "",
      },
    };

    await interaction.deferReply();
    cooldown = 10;
    const button = new ButtonBuilder()
      .setCustomId("çizbutton")
      .setLabel(interaction.user.username.toString())
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true);
    const row = new ActionRowBuilder().addComponents(button);

    axios
      .request(options)
      .then(async (response) => {
        if (response.data.replicate.status === "success") {
          axios
            .get(response.data.replicate.items[0].image_resource_url, {
              responseType: "arraybuffer",
            })
            .then(async (responsed) => {
              const buffer = Buffer.from(responsed.data, "binary");
            try {
              await interaction.editReply({
                files: [{ attachment: buffer, name: "image.jpg" }],
                content: `\`\`\`${içerik}\`\`\``,
                components: [row],
              });
            } catch (err) {
              await interaction.editReply({
                content: `Bunu gönderemem`,
              });
              console.error('Çiz komutunda hata: ' + err)
            }
            })
            .catch(console.error);
        } else {
          await interaction.editReply(`Bunu çizemem`);
        }
      })

      .catch((error) => {
        console.error(error);
      });
  },
};
