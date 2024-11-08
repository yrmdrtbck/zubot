const { createCanvas, loadImage, registerFont } = require('canvas');
const { AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const https = require('https');

module.exports = {
  data: {
    slash: true,
    enable: true,
    name: 'biliyor-muydunuz',
    description: 'Basit bir biliyor muydunuz yazısı yaparsınız.',
    options: [
      {
        name: 'yazı',
        description: 'En fazla 200 karakter olabilir',
        type: 3,
        required: true,
      },
    ],
  },
  async execute(interaction, client) {
    const text = interaction.options.getString('yazı');
    const limitedText = text.length > 200 ? text.substring(0, 200) : text;

    const fontUrl = 'https://cdn.glitch.global/eca4c4a6-13a9-4d0e-b6c4-d8d4d9717eb9/jockeyone.ttf?v=1725303069131';
    const fontPath = path.join(__dirname, 'temp-font.ttf');

    const downloadAndRegisterFont = () => {
      return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(fontPath);
        https.get(fontUrl, (response) => {
          response.pipe(file);
          file.on('finish', () => {
            file.close(() => {
              registerFont(fontPath, { family: 'jockeyone' });
              resolve();
            });
          });
        }).on('error', (err) => {
          fs.unlink(fontPath, () => reject(err));
        });
      });
    };

    try {
      await downloadAndRegisterFont();
      const image = await loadImage('https://cdn.glitch.global/eca4c4a6-13a9-4d0e-b6c4-d8d4d9717eb9/bunu%20biliyor%20muydunuz.png?v=1725301293247');
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const member = await interaction.guild.members.fetch(interaction.user.id);
      const userAvatarUrl = member.displayAvatarURL({extension: 'png'});
      const avatar = await loadImage(userAvatarUrl);

      const avatarSize = 216; 
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarSize / 2 + 10, avatarSize / 2 + 10, avatarSize / 2, 0, Math.PI * 2); 
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 10, 10, avatarSize, avatarSize);
      ctx.restore();

      ctx.font = '56px "jockeyone"';
      ctx.fillStyle = '#CDB981';
      ctx.textAlign = 'center';

      const maxWidth = 900; 
      const lineHeight = 63; 
      const x = canvas.width / 2;
      const y = canvas.height / 1.5; 

      wrapText(ctx, limitedText, x, y, maxWidth, lineHeight);

      const buffer = canvas.toBuffer('image/png');
      const attachment = new AttachmentBuilder(buffer, { name: 'biliyor-muydunuz.png' });

      await interaction.reply({ files: [attachment] });
      fs.unlinkSync(fontPath);
    } catch (error) {
      console.error('Error generating image:', error);
      await interaction.reply({ content: 'Görsel oluşturulurken bir hata oluştu.', ephemeral: true });
    }
  },
};

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  const lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  lines.forEach((line, i) => {
    ctx.fillText(line, x, y + i * lineHeight);
  });
}
