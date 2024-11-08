const {EmbedBuilder} = require('discord.js');

const GROQ_API_KEY = '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';
const {Groq} = require('groq-sdk');
const groq = new Groq({ apiKey: GROQ_API_KEY });

let cooldown = 0;
const kişilik = 'Türkçe konuşan bir robotsun asla başka dil konuşmazsın. Adın Zu-BOT, yardımcı bir yapay zekasın. Amacın sohbet etmek değil bilgi vermek, sorulara yanıt vermek.'

async function chatBot(input, hidden, interaction) {
try {
  const userInputArray = [{ role: "user", content: input }]
  const kişilikArray = [{ role: "system", content: kişilik}]
  const completion = await groq.chat.completions.create({
    messages: [...kişilikArray, ...userInputArray],
    model: "llama3-groq-8b-8192-tool-use-preview",
    max_tokens: 1500
  });
  const chatBotCevapMesaj = completion.choices[0]?.message?.content
  const embed = new EmbedBuilder()
  .setDescription('🌎 AI response to `' + input + '`;\n\n```'+chatBotCevapMesaj+'```')
  .setColor('Blurple')
  cooldown = 7
  if (hidden) {
    await interaction.editReply({embeds:[embed], ephemeral: true})
  } else {
    await interaction.editReply({embeds:[embed]})
  }
} catch (err) {
    if (hidden) {
    await interaction.editReply({content:'Tekrar dene', ephemeral: true})
  } else {
    await interaction.editReply({content:'Tekrar dene'})
  }
  console.error(err)
}
}

setInterval(() => {
  if (cooldown > 0) {
    cooldown--
  }
}, 1000)

module.exports = {
 data: {
    slash: true, 
    enable: true,  
    name: 'ai',
    description: 'Use ai (anywhere).',
    integration_types: [0,1],
    contexts: [0,1,2],
    options: [
        {
            name: "text",
            description: "Text option", 
            type: 3, 
            required: true 
        },
        {
            name: "hidden", 
            description: "Hide this message", 
            type: 5,
            required: false,
        }
    ],
   },
	async execute(interaction, client) { 
		const hidden = interaction.options.getBoolean('hidden') ?? true;
    const input = interaction.options.getString('text');
    if (input.length < 4) return await interaction.reply({content:'Daha uzun bir şeyler yaz', ephemeral: true});
    if (cooldown > 0) return await interaction.reply({content: cooldown +` saniye sonra tekrar dene`, ephemeral: true})
    if (hidden) {
      await interaction.deferReply({ephemeral:true})
    } else {
      await interaction.deferReply()
    }
    await chatBot(input, hidden, interaction)
  },
};
