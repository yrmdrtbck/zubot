const {QuickDB} = require("quick.db");
const db = new QuickDB();
const TwitchApi = require("node-twitch").default;
const twitch = new TwitchApi({
  client_id: "7w90mtwfczks4v36rierat6wg7vza2",
  client_secret: "pnnd5mc5r9fa4e2iqlxwzr9nbrhigf",
});
module.exports = {
  data: {
    slash: true,
    enable: true,
    name: "twitch-takip",
    description: "İstediğiz twitch kanalı yayın açtığında dmden bildirim yollar",
    options: [
      {
        name: "yayıncı_ismi",
        description: "Lütfen ismi doğru girdiğinizden emin olun (Kapatmak istiyorsanız sadece kapat yazın)",
        type: 3,
        required: true
      },
      {
        name: "oyun_ismi",
        description: "Spesifik bir oyun yayını açıldığında bildirim almak istiyorsanız tam oyun ismini girin.",
        type: 3,
        required: false
      }
    ]
  },

async execute(interaction, client) {
  const yayıncı = interaction.options.getString("yayıncı_ismi");
  const twitchKanalı = await twitch.getUsers(yayıncı);

  if (!twitchKanalı?.data || twitchKanalı?.data?.length < 1) return await interaction.reply({content:"Bu isimde bir twitch kanalı yok lütfen başka bir isimle tekrar dene.", ephemeral: true})
  let oyun = interaction.options.getString("oyun_ismi") || false;
  if (oyun && oyun.includes(",")) {
    let oyunlar = [];
    oyun = oyun.split(",").forEach(game => {
 
    oyunlar.push(game.trim())
  
  })
    oyun = oyunlar
  }
  let çok=false
  if (Array.isArray(oyun) &&oyun.length>1) {
    çok = true
  }
  if (yayıncı === "kapat") return await interaction.reply({content:"Twitch anımsatıcısını kapattın", ephemeral: true}), await db.delete(`yayıncı_${interaction.user.id}`), await db.delete(`yayıncıOyun_${interaction.user.id}`), await db.delete(`yayıncıGönderildi_${interaction.user.id}`)
  if (yayıncı === await db.get(`yayıncı_${interaction.user.id}`) && oyun === await db.get(`yayıncıOyun_${interaction.user.id}`)) return await interaction.reply({content: `Zaten bu yayıncıyı takip ediyorsun`, ephemeral: true})
  await db.set(`yayıncı_${interaction.user.id}`, yayıncı.toLowerCase());
  await db.set(`yayıncıOyun_${interaction.user.id}`, oyun);
  await db.delete(`yayıncıGönderildi_${interaction.user.id}`);
  await interaction.reply({content:`Başarılı! **${yayıncı}** yayında olduğu zaman${oyun ? (çok?` ve yayın **${oyun.toString().toUpperCase()}** kategorilerinden biriyse`: ` ve yayın **${oyun.toUpperCase()}** kategorisindeyse`) : ""} dmden haber vereceğim.`, ephemeral:true})
}}
