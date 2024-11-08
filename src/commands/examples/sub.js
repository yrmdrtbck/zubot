module.exports = {
  data: {
  slash: true,
  enable: false,
  name: "sub-command",
  description: "Subcommand example.",
  options: [
    {
      name: "role",
      description: "Get or edit permissions for a role",
      type: 2,
      options: [
        {
          name: "get",
          description: "Get permissions for a role",
          type: 1,
          options: [
            {
              name: "role",
              description: "sa",
              type: 8,
              required: true,
            },
          ],
        },
        {
          name: "edit",
          description: "Edit permissions for a role",
          type: 1,
        },
      ],
    },
    {
      name: "member",
      description: "Get or edit permissions for a role",
      type: 2,
      options: [
        {
          name: "get",
          description: "Get permissions for a role",
          type: 1,
        },
        {
          name: "edit",
          description: "Edit permissions for a role",
          type: 1,
        },
      ],
    },
  ],
 },
  async execute(interaction, client) {
    await interaction.reply({
      content: "> Ping: **" + client.ws.ping + " ms**",
      ephemeral: true,
    });
  },
};
