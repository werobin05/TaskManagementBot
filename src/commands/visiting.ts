import dotenv from "dotenv";
import { db } from "../database";
import { and, eq, sql } from "drizzle-orm";
import type { Command } from "../types/types";
import { Users, Visiting } from "../database/schema";

dotenv.config();

export const mv: Command = {
  name: "mv",
  description: "Отмечает посещение студентов в аудитории",
  async execute(message) {
    if (
      !message.member?.roles.cache.some(
        (r) => r.name === process.env.TEATHER_ROLE_NAME
      )
    ) {
      await message.reply("⛔ У тебя нет прав для выполнения этой команды.");
      return;
    }

    const voice_channel = message.member.voice.channel;
    if (!voice_channel) {
      await message.reply("🎙️ Зайдите в аудиторию, что бы отметить студентов");
      return;
    }

    const all_users = await db.select().from(Users);

    const voice_members = voice_channel.members;
    const marked_students: string[] = [];

    for (const [, m] of voice_members) {
      const user = all_users.find((u) => u.discord_id === BigInt(m.id));

      if (user) {
        const today_visit = await db
          .select()
          .from(Visiting)
          .where(
            and(
              eq(Visiting.user_id, user.user_id),
              eq(Visiting.date_visit, sql`CURRENT_DATE`)
            )
          );
        
        if (today_visit.length === 0) {
        }
      }
    }
  },
};
