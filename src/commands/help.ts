import type { Command } from "../types/types"
import { EmbedBuilder, Message } from 'discord.js';

const help: Command = {
    name: "help",
    description: "Выводит список всех доступных команд",
    async execute(message: Message, args: string[], command?: Map<string, Command>) {
        const bot_name = message.client.user?.username || "bot";
        const color = parseInt("37bd83", 16)
        const embed = new EmbedBuilder()
          .setColor(color)
          .setTitle(`${bot_name} - Список команд`)
          .setDescription('Список доступных команд для использования\n префикс бота - "?"')
          .setThumbnail(message.client.user?.displayAvatarURL() || null)
          .setTimestamp()
          .setFooter({
            text: `${message.author.username} дежи список все команд`,
          });

        if (command) {
            let i = 1;
            for (const [name, cmd] of command) {
                embed.addFields({
                    name: `${i++}. ?${name}`,
                    value: cmd.description || "Описание отсутствует",
                    inline: false,
                });
            }
        }
        await message.reply({ embeds: [embed] });
    },
};

export default help