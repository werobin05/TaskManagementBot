import type { Command } from "../types/types"
import { EmbedBuilder, Message } from 'discord.js';

const help: Command = {
    name: "help",
    description: "Выводит список всех доступных команд",
    async execute(message: Message, args: string[], command?: Map<string, Command>) {
        const bot_name = message.client.user?.username || "bot";
        const color = parseInt("5c92ff", 16)
        const embed = new EmbedBuilder()
          .setColor(color)
          .setTitle(`${bot_name} - команды, для твоего удобства`)
          .setDescription('Что бы использовать мои команды нужно написать: ?')
          .setThumbnail(message.client.user?.displayAvatarURL() || null)
          .setTimestamp()
          .setFooter({
            text: `${message.author.username} вот тебе список команд!`,
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