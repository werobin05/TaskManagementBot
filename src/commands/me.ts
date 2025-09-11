import { eq } from "drizzle-orm";
import { db } from "../database";
import type { Command } from "../types/types";
import { Rating, Task, Users, UserTask } from "../database/schema";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";

export const me: Command = {
  name: "me",
  description: "Открывает ваш профиль",
  async execute(message) {
    const color = parseInt("37bd83", 16);

    const discord_id = BigInt(message.author.id);

    const [profile_data] = await db
      .select()
      .from(Users)
      .leftJoin(Rating, eq(Users.user_id, Rating.user_id))
      .where(eq(Users.discord_id, discord_id));

    const tasks = await db
      .select({
        task: Task,
        user_task: UserTask,
      })
      .from(Task)
      .leftJoin(UserTask, eq(Task.task_id, UserTask.task_id))
      .where(eq(UserTask.user_id, profile_data.Users.user_id));

    if (!profile_data) {
      message.reply("❌ Профиль не найден в базе.");
    }

    const general_task =
      tasks.find((t) => t.task.name_task && t.task.status)?.task.name_task ??
      "—";
    const personal_task =
      tasks.find((t) => t.user_task?.name_task && t.user_task?.status)
        ?.user_task?.name_task ?? "—";

    const embed = new EmbedBuilder()
      .setTitle(`👤 ${profile_data.Users.full_name || message.author.username}`)
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
        { name: "Общие задачи", value: general_task ?? "-", inline: true },
        { name: "Личная задача", value: personal_task ?? "-", inline: true }
      )
      .setColor(color)
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("open_task")
        .setLabel("📋 Открыть задачи")
        .setStyle(ButtonStyle.Primary),
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
