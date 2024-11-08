const fetch = require("node-fetch");
const ax = require("axios");

let tayfaLink = "Tayfa linki yükleniyor...";
let membersMap = new Map();

const instagramScraper = {
  method: "GET",
  url: "https://instagram-bulk-profile-scrapper.p.rapidapi.com/clients/api/ig/ig_profile",
  params: {
    ig: "tayfa.csn",
    response_type: "short",
    corsEnabled: "false",
  },
  headers: {
    "x-rapidapi-key": "40c90db685mshc8da432b460108ap1ff11cjsnd51d67342462",
    "x-rapidapi-host": "instagram-bulk-profile-scrapper.p.rapidapi.com",
  },
};

async function tayfaCheck() {
  try {
    const response = await ax.request(instagramScraper);
    const bio = response.data[0]?.biography;
    if (bio?.includes("TAYFA")) {
      return bio.match(/TAYFA.*?(?=-)/)[0];
    } else {
    return "Tayfa bulunamadı"
    }
  } catch (error) {
    console.error(error);
  }
}

const {
  Interaction,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelType,
} = require("discord.js");

const upVote = "1104112508517748818";
const downVote = "1104112522707087471";
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const { Cron } = require("croner");

const TwitchApi = require("node-twitch").default;
const fs = require("fs");
const twitch = new TwitchApi({
  client_id: "7w90mtwfczks4v36rierat6wg7vza2",
  client_secret: "pnnd5mc5r9fa4e2iqlxwzr9nbrhigf",
});
const {
  depremRolID,
  depremKanalID,
  ayetKanalID,
} = require("../base/settings.json");
module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    //await db.set("oyunlar", ["Minecraft", "Red Dead Redemption 2", "GTA 5", "Among Us", "Brawlhalla", "Left 4 Dead 2", "Portal 1/2", "Half Life (Story)", "SCP Containment Breach", "Raft", "Dying Light 1/2", "Garry's Mod", "Subnautica", "Fall Guys", "Fortnite", "Outlast", "FNAF", "Baldi's Basics", "The Forest", "Lethal Company", "Undertale", "Slime Rancher 1/2", "Speedrunners", "Euro Truck Simulator 2", "Cyberpunk 2077", "Plants vs. Zombies", "Terraria", "Subway Surfers", "Mario Kart", "Sub Rosa"])
    const guild = await client.guilds.cache.get("1083453606801453126");
    const members = await guild.members.fetch();
    /*const tümVeriler = await db.all()
    tümVeriler.forEach(entry => {
      const {id, value} = entry
      if (id.includes("yayın")) {
        console.log(id, value)
      }
    })*/

    members.forEach((member) => {
      if (!member.user.bot) return membersMap.set(member.id, member);
    });

    const genel = client.channels.cache.get("1105097856433520740");
    const tayfaLinkDB = (await db.get("tayfaLink")) || "Tayfa linki yükleniyor";

    const readyEmbed = new EmbedBuilder()
      .setTitle("Zu-BOT uptime süresi")
      .setColor("#fcf003")
      .setDescription(
        `**Son başlatma zamanı:**\n<t:${Date.now()
          .toString()
          .substring(0, 10)}:R>`
      )
      .setThumbnail(client.user.displayAvatarURL())
      .setTimestamp();

    const readyMessage = await client.channels.cache
      .get("1270011148728664136")
      .messages.fetch("1270012776328335412");

    if (readyMessage) {
      readyMessage.edit({ embeds: [readyEmbed] });
    } else {
      console.log("Ready log mesajı bulunamadı");
    }
    console.log(client.user.tag + " hazır.");

    Cron("0 */30 * * * *", async () => {
      const link = await tayfaCheck();
      if (!link) return;
      await db.set("tayfaLink", link);
      client.user.setPresence({
        status: "online",
        activities: [
          {
            name: link,
            type: 1,
          },
        ],
      });
    });
    client.user.setPresence({
      status: "online",
      activities: [
        {
          name: tayfaLinkDB,
          type: 1,
        },
      ],
    });

    setInterval(async () => {
      for (const member of membersMap.values()) {
        const yayıncı = (await db.get(`yayıncı_${member.id}`)) || false;
        if (yayıncı) {
          const yayıncıGönderildi = await db.get(
            `yayıncıGönderildi_${member.id}`
          );
          const getStream =
            (await twitch.getStreams({ channel: yayıncı })) || false;
          const oyun = (await db.get(`yayıncıOyun_${member.id}`)) || false;
          const yayıncıOyunu =
            getStream?.data[0]?.game_name.toLowerCase() || false;
          if (oyun) {
            if (getStream?.data[0]?.type === "live") {
              if (oyun.toString().toLowerCase().includes(yayıncıOyunu)) {
                const lastGame = await db.get(`yayıncıLastGame_${member.id}`);
                if (yayıncıGönderildi && yayıncıOyunu !== lastGame)
                  return (
                    await member.send(
                      `https://m.twitch.tv/${yayıncı} şu an **${yayıncıOyunu.toUpperCase()}** oyunu için yayında!\n\`\`\`${
                        getStream.data[0].title
                      }\`\`\``
                    ),
                    await db.set(`yayıncıLastGame_${member.id}`, yayıncıOyunu)
                  );
                if (yayıncıGönderildi) return;
                await db.set(`yayıncıGönderildi_${member.id}`, true);
                await db.set(`yayıncıLastGame_${member.id}`, yayıncıOyunu);
                await member.send(
                  `https://m.twitch.tv/${yayıncı} şu an **${yayıncıOyunu.toUpperCase()}** oyunu için yayında!\n\`\`\`${
                    getStream.data[0].title
                  }\`\`\``
                );
              } else {
                await db.set(`yayıncıGönderildi_${member.id}`, false);
              }
            } else {
              await db.set(`yayıncıGönderildi_${member.id}`, false);
            }
          } else {
            if (getStream?.data[0]?.type === "live") {
              const lastGame = await db.get(`yayıncıLastGame_${member.id}`);

              if (yayıncıGönderildi && yayıncıOyunu !== lastGame) {
                await member.send(
                  `https://m.twitch.tv/${yayıncı} şu an **${yayıncıOyunu.toUpperCase()}** oyunu için yayında.\n\`\`\`${
                    getStream.data[0].title
                  }\`\`\``
                );
                await db.set(`yayıncıLastGame_${member.id}`, yayıncıOyunu);
                return;
              }
              if (yayıncıGönderildi) return;
              await db.set(`yayıncıLastGame_${member.id}`, yayıncıOyunu);
              await db.set(`yayıncıGönderildi_${member.id}`, true);
              await member.send(
                `https://m.twitch.tv/${yayıncı} şu an **${yayıncıOyunu.toUpperCase()}** oyunu için yayında.\n\`\`\`${
                  getStream.data[0].title
                }\`\`\``
              );
            } else {
              await db.set(`yayıncıGönderildi_${member.id}`, false);
            }
          }
        }
      }
      guild.channels.cache.forEach((channel) => {
        if (
          channel.type === ChannelType.GuildVoice &&
          channel.members.size > 0
        ) {
          channel.members.forEach(async (member) => {
            //console.log(member.user.id);
            await db.add(`${member.user.id}_zucoin`, 1);
          });
        }
      });

      let sonDeprem = (await db.get("sondeprem")) || {};
      ax.get("https://api.orhanaydogdu.com.tr/deprem/kandilli/live")
        .then(async (response) => {
          if (
            (sonDeprem !== response.data.result[0].earthquake_id &&
              response.data.result[0].mag >= 4 &&
              !response.data.result[0].title.includes("ERMENISTAN") &&
              !response.data.result[0].title.includes("YUNANISTAN")) ||
            (response.data.result[0].title.includes("ISTANBUL") &&
              response.data.result[0].mag >= 3.5)
          ) {
            const depremKanal = client.channels.cache.get(depremKanalID);
            const depremEmbed = new EmbedBuilder()
              .setAuthor({ name: "Yeni Deprem Bildirimi" })
              .setTitle(`${response.data.result[0].title}`)
              .setColor("#FF0000")
              .addFields(
                {
                  name: "Büyüklük",
                  value: response.data.result[0].mag.toString(),
                  inline: true,
                },
                {
                  name: "Derinlik",
                  value: response.data.result[0].depth.toString() + " km",
                  inline: true,
                },
                {
                  name: "\u200B",
                  value: `<t:${response.data.result[0].created_at - 3600}:R>`,
                }
              )
              .setTimestamp((response.data.result[0].created_at - 3600) * 1000);
            await db.set("sondeprem", response.data.result[0].earthquake_id);
            await depremKanal.send({
              content: `<@&${depremRolID}>`,
              embeds: [depremEmbed],
            });
          }
        })
        .catch((error) => {
          console.error("Hata:", error);
        });
    }, 60000);
  },
};
