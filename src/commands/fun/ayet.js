module.exports = {
  data: {
  slash: true,
  enable: true,
  name: "ayet",
  description: "Rastgele ayet atar veya girdiğiniz bir surenin ayetini atar.",
  integration_types: [0,1],
  contexts: [0,1,2],
  options: [
    {
      name: "sure",
      description: "Sure adı",
      type: 3,
      required: false,
    },
    {
      name: "ayet",
      description: "Ayet sayısı",
      type: 4,
      required: false,
    },
  ],
    },
  async execute(interaction, client) {
    await interaction.deferReply()
    const ax = require("axios");
    const rSurah = Math.floor(Math.random() * (114 - 1 + 1)) + 1;
    let sure = interaction.options.getString("sure");
    if (sure) {
      sure = sure.toLowerCase();
    }
    const ayet = interaction.options.getInteger("ayet");

    if (sure) {
      const sureler = "https://api.acikkuran.com/surahs";
      const sureResponse = await ax.get(sureler);
      const sureh = sureResponse.data.data;
      const sureVerisi = sureh.find((veri) => veri.name.toLowerCase() === sure);
      if (sureVerisi) {
        const sureId = sureVerisi.id;
        const ayetSayi = sureVerisi.verse_count;
        const rAyet = Math.floor(Math.random() * (ayetSayi - 1 + 1)) + 1;

        const bulunanSure = `https://api.acikkuran.com/surah/${sureId}/verse/${rAyet}?author=11`;
        const bulunanSureResponse = await ax.get(bulunanSure);
        const bulunanSureh = bulunanSureResponse.data.data;

        if (ayet) {
          if (ayet > ayetSayi || ayet < 0) {
            await interaction.editReply(
              `${sureVerisi.name} Suresinde ${ayetSayi} ayet var. Yalnızca bu aralıkta bir ayet yazabilirim.`
            );
          } else {
            const ayetliSure = `https://api.acikkuran.com/surah/${sureId}/verse/${ayet}?author=11`;
            const ayetliSureResponse = await ax.get(ayetliSure);
            const ayetliSureh = ayetliSureResponse.data.data;
            interaction.editReply(
              `**${ayetliSureh.translation.text}**\n• *(${sureVerisi.name} Suresi, ${ayet}. Ayet)*`
            );
          }
          const bulunanSure = `https://api.acikkuran.com/surah/${sureId}/verse/${ayet}?author=11`;
        } else {
          await interaction.editReply(
            `**${bulunanSureh.translation.text}** \n• *(${sureVerisi.name} Suresi, ${rAyet}. Ayet)*`
          );
        }
      } else {
        await interaction.editReply(
          `${sure} suresini bulamadım. Lütfen tekrar dener misin?`
        );
      }
    } else {
      const surah = `https://api.acikkuran.com/surah/${rSurah}`;
      const resp2 = await ax.get(surah);
      const data2 = resp2.data;
      const aCount = data2.data.verse_count;

      const rAyet = Math.floor(Math.random() * (aCount - 1 + 1)) + 1;
      const kuran = `https://api.acikkuran.com/surah/${rSurah}/verse/${rAyet}?author=11`;
      const resp = await ax.get(kuran);
      const data = resp.data;
      const trans = data.data.transcription;
      const sName = data2.data.name;
      const aNumber = data.data.verse_number;

      //console.log(`Sure Sayısı: ${rSurah} - Ayet Sayısı: ${rAyet}`);

      const metin = data.data.translation.text;

      await interaction.editReply(
        `**${metin}** \n• *(${sName} Suresi, ${aNumber}. Ayet)*`
      );
    }
  },
};
