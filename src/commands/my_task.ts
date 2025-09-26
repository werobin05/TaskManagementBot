import { db } from "../database";
import type { Command } from "../types/types";
import { UserTask, Users } from "../database/schema";
import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { eq } from "drizzle-orm";

export const MyTask: Command = {
  name: "mt",
  description: "Здесь отоброжаются ваши личные задачи",
  async execute(message) {
    const discord_id = BigInt(message.author.id);

    const user = await db
      .select()
      .from(Users)
      .where(eq(Users.discord_id, discord_id))
      .then((res) => res[0]);

    if (!user) {
      await message.reply("❌ Ты не зарегистрирован в системе.");
      return;
    }

    const my_task = await db
      .select()
      .from(UserTask)
      .where(eq(UserTask.user_id, user.user_id));

    if (my_task.length !== 0) {
      const select_menu = new StringSelectMenuBuilder()
        .setCustomId("my_task")
        .setPlaceholder("Выбери задачу")
        .addOptions(
          my_task.map((task) => ({
            label: task.task_name,
            value: String(task.task_deadline),
            description: task.task_desc ?? "Описание отсуствует",
          }))
        );

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        select_menu
      );

      await message.reply({
        content: "📋 Твой список задач: ",
        components: [row]
      })
    } else {
      await message.reply("📭 У тебя пока нет задач.");
      return;
    }
  },
};

export default MyTask;
