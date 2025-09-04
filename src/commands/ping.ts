import type { Command } from "./types";

const ping: Command = {
  name: "ping",
  description: "Простой пинг",
  async execute(message) {
    await message.reply("🏓 Pong!");
  },
};

export default ping;