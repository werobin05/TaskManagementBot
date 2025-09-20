import { eq } from "drizzle-orm";
import { db } from "../database";
import type { Command } from "../types/types";
import { Rating, Users } from "../database/schema";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";

export const me: Command = {
  name: "me",
  description: "Просмотр вашего профиля",
  async execute(message) {
    const color = parseInt("37bd83", 16);

    const discord_id = BigInt(message.author.id);

    const [profile_data] = await db
      .select()
      .from(Users)
      .leftJoin(Rating, eq(Users.user_id, Rating.user_id))
      .where(eq(Users.discord_id, discord_id));

    if (!profile_data) {
      message.reply("❌ Профиль не найден в базе.");
    }

    const embed = new EmbedBuilder()
      .setTitle(`👤 ${profile_data.Users.last_name || message.author.username}`)
      .setThumbnail(message.author.displayAvatarURL({ size: 512 }))
      .addFields(
        {
          name: "Группа",
          value: profile_data.Users.group || "-",
          inline: true,
        },
        {
          name: "Рейтинг",
          value: `${profile_data.Rating?.ball || 0}`,
          inline: true,
        },
        {
          name: "Курс",
          value: `${profile_data.Users.course}`,
          inline: true,
        }
      )
      .addFields({
        name: "Логин",
        value: `${profile_data.Users.login || "not login"}`,
      })
      .setColor(color)
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("add_data")
        .setLabel("🎫 Добавить данные")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("edit_profile")
        .setLabel("✏️ Редактировать")
        .setStyle(ButtonStyle.Secondary)
    );

    message.author
      .send({ embeds: [embed], components: [row] })
      .then(() => {
        message.react("✅");
      })
      .catch(() => {
        message.reply(
          "❌ Не могу отправить личное сообщение. Включите DMs у себя."
        );
      });
  },
};

export default me;
