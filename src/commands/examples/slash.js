module.exports = {
 data: {
    slash: true, 
    enable: false,  
    name: 'slash',
    description: 'Slash command example.',
    options: [
        {
            name: "string",
            description: "String option", 
            type: 3, 
            required: true 
        },
        {
            name: "number", 
            description: "Number option", 
            type: 4, 
            required: true 
        }
    ],
   },
	async execute(interaction, client) { 
		await interaction.reply({content: "> Ping: **"+client.ws.ping+" ms**", ephemeral: true})
  },
};
