module.exports = {
  data: {
    slash: false,
    enable: true,
    name: "deneme",
    aliases: ['deneme2']
  },
  async execute(message, client) {
    await message.reply("selam");
  },
};
