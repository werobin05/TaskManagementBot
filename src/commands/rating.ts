import { eq } from "drizzle-orm";
import { db } from "../database";
import { Users, Rating } from "../database/schema";
import type { Command } from "../types/types";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
} from "discord.js";

const PAGE_SIZE = 5;
const MAX_NAME = 30;
const MAX_GROUP = 10;

function format_ceil(text: string, max: number) {
  if (text.length > max) {
    return text.slice(0, max - 1) + "...";
  }
  return text.padEnd(max, " ");
}
const rating: Command = {
  name: "rating",
  description: "Таблица рейтинга",
  async execute(message) {
    try {
      const color = parseInt("5c92ff", 16);
      const data = await db
        .select({
          first_name: Users.first_name,
          last_name: Users.last_name,
          Patronymic: Users.patronymic,
          group: Users.group,
          scores: Rating.ball,
        })
        .from(Users)
        .leftJoin(Rating, eq(Users.user_id, Rating.user_id));
      if (!data.length) {
        message.reply("🏆 Рейтинг пуст");
        return;
      }

      const sorted = data.sort((a, b) => (b.scores ?? 0) - (a.scores ?? 0));
      const total_page = Math.ceil(sorted.length / PAGE_SIZE);
      let page: number = 0;

      function generate_embed(page: number) {
        const start = page * PAGE_SIZE;
        const slice = sorted.slice(start, start + PAGE_SIZE);

        let desc =
          "```md\n № | ФИО                            | Группа     | Баллы\n";
        desc += "--------------------------------------------------------\n";

        slice.forEach((item, i) => {
          const num = (start + i + 1).toString().padEnd(2, " ");
          const name = format_ceil(
            item.first_name + " " + item.last_name + " " + item.Patronymic ||
              "-",
            MAX_NAME
          );
          const group = format_ceil(item.group || "-", MAX_GROUP);
          const score = (item.scores ?? 0).toString().padEnd(5, " ");

          desc += `${num} | ${name} | ${group} | ${score}\n`;
        });

        desc += "```";

        return new EmbedBuilder()
          .setColor(color)
          .setTitle("🏆 Таблица рейтинга")
          .setDescription(desc)
          .setFooter({
            text: `Страница ${
              page + 1
            }/ ${total_page} | P.S Таблица работает в течении 2 минут`,
          });
      }

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("⏪ Назад")
          .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Вперёд ⏩️")
          .setStyle(ButtonStyle.Success)
      );

      const reply = await message.reply({
        embeds: [generate_embed(page)],
        components: [row],
      });

      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 2 * 60_000,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.user.id !== message.author.id) {
          return interaction.reply({
            content: "⛔️ Это не твоя кнопка",
            flags: 64,
          });
        }
        if (interaction.customId === "prev") {
          page = page > 0 ? page - 1 : total_page - 1;
        } else {
          page = page + 1 < total_page ? page + 1 : 0;
        }

        await interaction.update({
          embeds: [generate_embed(page)],
          components: [row],
        });
      });

      collector.on("end", async () => {
        await reply.edit({
          components: [],
        });
      });
    } catch (error) {
      console.error("Ошибка команды rating:", error);
      message.reply("❌ Произошла ошибка при загрузке рейтинга.");
    }
  },
};

export default rating;
