const {
  Interaction,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  EmbedBuilder,
  TextInputBuilder,
  ModalBuilder,
  TextInputStyle,
  InteractionType,
} = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const upVote = "1104112508517748818";
const downVote = "1104112522707087471";
const { depremRolID } = require("../base/settings.json");
const ax = require("axios");
const FormData = require("form-data");
const data = new FormData();
let itiraflar = [];


module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.log(error);
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }


    if (interaction.customId === "köstebekKatıl") {
      const katılımcılar = (await db.get("köstebekKatılımcılar")) || [];
      if (katılımcılar.includes(interaction.user.id)) {
        await interaction.reply({
          content:
            "Zaten oyuna katılmışsın. Ayrılmak istiyorsan **Ayrıl** butonuna bas",
          ephemeral: true,
        });
      } else {
        katılımcılar.push(interaction.user.id);
        let katılımcıString = "";
        katılımcılar.forEach((id) => {
          katılımcıString += `<@${id}>\n`;
        });
        const newEmbed = new EmbedBuilder()
          .setTitle("Hain Kim?")
          .setColor("#00CC00")
          .addFields({ name: "Katılımcılar", value: katılımcıString });
        await db.set("köstebekKatılımcılar", katılımcılar);
        await interaction.update({ embeds: [newEmbed] });
        await interaction.followUp({
          content: "Hain Kim? oyununa katıldın ✅",
          ephemeral: true,
        });
      }
    }

    if (interaction.customId === "köstebekAyrıl") {
      let katılımcılar = (await db.get("köstebekKatılımcılar")) || [];
      if (!katılımcılar.includes(interaction.user.id)) {
        await interaction.reply({
          content:
            "Zaten katılmamışsın ki. Katılmak için **Katıl** butonuna bas",
          ephemeral: true,
        });
      } else {
        let yeniKatılımcılar = katılımcılar.filter(
          (id) => id !== interaction.user.id
        );
        let katılımcıString = "";
        if (yeniKatılımcılar.length > 0) {
          yeniKatılımcılar.forEach((id) => {
            katılımcıString += `<@${id}>\n`;
          });
        } else {
          katılımcıString = "Henüz kimse katılmadı";
        }
        await db.set("köstebekKatılımcılar", yeniKatılımcılar);
        const newEmbed = new EmbedBuilder()
          .setTitle("Hain kim?")
          .setColor("#00CC00")
          .addFields({ name: "Katılımcılar", value: katılımcıString });
        await interaction.update({ embeds: [newEmbed] });
        await interaction.followUp({
          content: "Hain Kim? oyunundan ayrıldın",
          ephemeral: true,
        });
      }
    }
    if (interaction.customId === "köstebekBaşlat") {
      const kullanabilenIdler = ["968507369715802162", "1049295355881205850"];
      if (!kullanabilenIdler.some((id) => interaction.user.id === id))
        return await interaction.reply({
          content:
            "Ohoo, bu tuşa herkes basabilseydi sence de ortam çok karışmaz mıydı?",
          ephemeral: true,
        });
      let katılımcılar = await db.get("köstebekKatılımcılar");
      if (katılımcılar.length < 2)
        return await interaction.reply({
          content: "Başlamak için en az 3 kişinin katılması gerek",
          ephemeral: true,
        });
      const oyunlar = await db.get("oyunlar");
      let hainNumber = await ax.get(
        `https://www.random.org/integers/?num=1&min=0&max=${
          katılımcılar.length - 1
        }&col=1&base=10&format=plain&rnd=new`
      );
      let gameNumber = await ax.get(
        `https://www.random.org/integers/?num=1&min=0&max=${
          oyunlar.length - 1
        }&col=1&base=10&format=plain&rnd=new`
      );
      const oyun = oyunlar[gameNumber.data];
      const hainId = katılımcılar[hainNumber.data];
      const hain = await interaction.guild.members.fetch(hainId);
      const masumlar = katılımcılar.filter((id) => id !== hainId);
      masumlar.forEach(async (masum) => {
        const masumBiri = await interaction.guild.members.fetch(masum);
        await masumBiri.send(
          "Oyun başladı. Sen hain değilsin\n**Oyunun:** `" + oyun + "`"
        );
      });
      await hain.send(
        "Oyun başladı. Sen hainsin, sorular sorarak oyunu bulmaya çalış."
      );
      let yeniOyunlar = oyunlar.filter((oyuns) => oyuns !== oyun);
      await db.set("oyunlar", yeniOyunlar);
      await interaction.reply({ content: "Oyun başladı", ephemeral: true });
    }

    if (interaction.customId === "köstebekEkle") {
      const modal = new ModalBuilder()
        .setCustomId("köstebekEkleMenü")
        .setTitle("Oyun Ekleme Menüsü");

      const shortMessageInput = new TextInputBuilder()
        .setCustomId("oyunInput")
        .setLabel("Oyun İsmi")
        .setPlaceholder("Örn: Half-Life")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const actionRow = new ActionRowBuilder().addComponents(shortMessageInput);
      modal.addComponents(actionRow);
      await interaction.showModal(modal);
    }

    if (interaction.customId === "köstebekEkleMenü") {
      const oyun = interaction.fields.getTextInputValue("oyunInput");
      let oyunlar = await db.get("oyunlar");
      let oyunlog = (await db.get("oyunlog")) || [];
      oyunlog.push({ oyun: oyun, ekleyen: interaction.user.username });
      oyunlar.push(oyun);
      await db.set("oyunlog", oyunlog);
      await db.set("oyunlar", oyunlar);
      await interaction.reply({
        content: `**Oyun eklendi**: ${oyun}`,
        ephemeral: true,
      });
    }

    if (interaction.customId === "köstebekSıfırla") {
      await interaction.reply({ content: "oho", ephemeral: true });
    }

    if (interaction.customId === "köstebekÇıkar") {
      const kullanabilenIdler = ["968507369715802162"];
      if (!kullanabilenIdler.some((id) => interaction.user.id === id))
        return await interaction.reply({
          content: "Can't use this yet",
          ephemeral: true,
        });
      const modal = new ModalBuilder()
        .setCustomId("köstebekÇıkarMenü")
        .setTitle("Oyuncu Çıkarma Menüsü");
      const shortMessageInput = new TextInputBuilder()
        .setCustomId("oyuncuId")
        .setPlaceholder("Katılımcının ID'si")
        .setLabel("Çıkarmak istediğiniz oyuncunun id'sini girin")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const actionRow = new ActionRowBuilder().addComponents(shortMessageInput);
      modal.addComponents(actionRow);
      await interaction.showModal(modal);
    }

    if (interaction.customId === "köstebekÇıkarMenü") {
      const oyuncuId = interaction.fields.getTextInputValue("oyuncuId");
      const katılımcılar = await db.get("köstebekKatılımcılar");
      if (!katılımcılar.includes(oyuncuId))
        return await interaction.reply({
          content: "Bu kişi zaten oyunda değil",
          ephemeral: true,
        });
      const yeniKatılımcılar = katılımcılar.filter(
        (katılımcı) => katılımcı !== oyuncuId
      );
      await db.set("köstebekKatılımcılar", yeniKatılımcılar);
      let katılımcılarString = "";
      if (yeniKatılımcılar.length > 0) {
        yeniKatılımcılar.forEach((id) => {
          katılımcılarString += `<@${id}>\n`;
        });
      } else {
        katılımcılarString = "Henüz kimse katılmadı";
      }
      const yeniEmbed = new EmbedBuilder()
        .setTitle("Hain kim?")
        .setColor("#00CC00")
        .addFields({ name: "Katılımcılar", value: katılımcılarString });
      await interaction.update({ embeds: [yeniEmbed] });
      await interaction.followUp({
        content: `Artık <@${oyuncuId}> oyunda değil`,
        ephemeral: true,
      });
    }

    if (interaction.customId === "itirafEkle") {
      const modal = new ModalBuilder()
        .setCustomId("itirafMenü")
        .setTitle("İtiraf Ekleme Menüsü");

      const shortMessageInput = new TextInputBuilder()
        .setCustomId("itirafInput")
        .setLabel("İtirafını yaz")
        .setPlaceholder("Mehmetle 1 gece beraberdik.")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const actionRow = new ActionRowBuilder().addComponents(shortMessageInput);
      modal.addComponents(actionRow);
      await interaction.showModal(modal);
    }

    if (interaction.customId === "itirafMenü") {
      const itiraf = interaction.fields.getTextInputValue("itirafInput");
      await itiraflar.push(itiraf);
      await interaction.reply({
        content:
          "İtirafını ekledik sen ve Allah'tan başka kimse bilemez. (Kimseye söylemediğin sürece)",
        ephemeral: true,
      });
    }

if (interaction.customId === "itirafGöster") {
  const kullanabilenIdler = ["968507369715802162", "1049295355881205850"];
  if (!kullanabilenIdler.includes(interaction.user.id)) {
    return await interaction.reply({
      content: "Ohoo! Sen basamazsın :angry: :fish:",
      ephemeral: true,
    });
  }

  if (itiraflar.length === 0) {
    return await interaction.reply({
      content: "Hiç itiraf yok",
      ephemeral: true,
    });
  }

  let randomSayı = await itiraflar.length === 1 ? 0 : Math.floor(Math.random() * itiraflar.length);
  const randomItiraf = itiraflar[randomSayı];

  await interaction.reply({ content: "İtiraf geliyor...", ephemeral: true });


  await interaction.channel.send(randomItiraf);
  await itiraflar.splice(randomSayı, 1);
}
    
  },
};
