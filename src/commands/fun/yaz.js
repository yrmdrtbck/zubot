module.exports = {
  data:{
    slash: true, 
    enable: true, 
    name: 'yaz',
    description: 'Fotoğrafa yazı yazdır.',
    integration_types: [0,1],
    contexts: [0,1,2],
    options: [
        {
            name: "metin",
            description: "Metin girin.", 
            type: 3, 
            required: true 
        },
    ],
    },
	async execute(interaction, client) { 
    const {registerFont, createCanvas} = require('canvas')
    const fs = require('fs')
    const path = require('path')
    const fetch = require("node-fetch")
    const fontUrl = "https://cdn.glitch.global/eca4c4a6-13a9-4d0e-b6c4-d8d4d9717eb9/times.ttf?v=1716718095736";
    const { AttachmentBuilder } = require("discord.js");
		let text = interaction.options.getString('metin').toLocaleUpperCase('tr-TR');  
        if (!text.endsWith('.')) {
            text += '.';
        }
    const response = await fetch(fontUrl)
    if (!response.ok) return console.log("Font sıkıntısı")
    const fontBuffer = await response.buffer()
    const fontPath = path.join(__dirname, 'times.ttf');

        fs.writeFileSync(fontPath, fontBuffer);
    registerFont(fontPath, { family: 'Times New Roman' });
        let canvasWidth = 700;
        let canvasHeight = 250;
        const canvas = createCanvas(canvasWidth, canvasHeight);//DONE💀
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);


        let fontSize = 65; 
        context.font = `${fontSize}px "Times New Roman"`;
        context.fillStyle = '#FF0000'; 

        while (context.measureText(text).width > canvasWidth - 20 && fontSize > 10) {
            fontSize -= 2;
            context.font = `${fontSize}px "Times New Roman"`;
        }

        const textWidth = context.measureText(text).width;
        const textHeight = fontSize;
        canvasWidth = textWidth + 40;
        canvasHeight = textHeight + 40;

        const newCanvas = createCanvas(canvasWidth, canvasHeight);
        const newContext = newCanvas.getContext('2d');

        newContext.clearRect(0, 0, newCanvas.width, newCanvas.height);

        newContext.font = `${fontSize}px "Times New Roman"`;
        newContext.fillStyle = '#FF0000';

        newContext.fillText(text, 20, canvasHeight / 2 + textHeight / 3);

        const attachment = new AttachmentBuilder(newCanvas.toBuffer(), { name: 'text-image.png' });
  
        await interaction.reply({ files: [attachment] });
  },
};
