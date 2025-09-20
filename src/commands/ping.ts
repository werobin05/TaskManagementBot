import type { Command } from "../types/types";

const ping: Command = {
  name: "ping",
  description: "Проверка задержки соединения в миллисекундах",
  async execute(message) {
    const sent = await message.reply("🏓 Проверяю пинг...");
    const latency = sent.createdTimestamp - message.createdTimestamp;
    const api_latency = Math.round(message.client.ws.ping);

    await sent.edit(
      `🏓 Pong!\n` +
        `Задержка сообщения: **${latency}ms**\n` +
        `API задержка: **${api_latency}ms**`
    );
  },
};

export default ping;
