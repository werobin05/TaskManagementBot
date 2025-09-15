import dotenv from "dotenv";
import { db } from "../database";
import { and, eq, sql } from "drizzle-orm";
import type { Command } from "../types/types";
import { Rating, Users, Visiting } from "../database/schema";
import { StageChannel, VoiceChannel } from "discord.js";

dotenv.config();

const POINTS_PER_VISIT = 1;
const MAX_POINTS = 1;

export const mv: Command = {
  name: "mv",
  description:
    "Отмечает посещение студентов в аудитории. \nДанную команду может исполнять только преподаватель",
  async execute(message) {
    if (
      !message.member?.roles.cache.some(
        (r) => r.id === process.env.TEACHER_ROLE_ID
      )
    ) {
      await message.reply("⛔ У тебя нет прав для выполнения этой команды.");
      console.log("TEATHER_ROLE_ID:", process.env.TEACHER_ROLE_ID);
      console.log("User roles:", message.member?.roles.cache.map(r => r.id));
      return;
    }

    const voice_channel = message.guild?.channels.cache.get(process.env.ALLOWED_VOICE_CHANNEL_ID!);
    if (!voice_channel) {
      await message.reply("🎙️ Зайдите в аудиторию, что бы отметить студентов");
      return;
    }

    if (!voice_channel || !(voice_channel instanceof VoiceChannel || voice_channel instanceof StageChannel)) {
      await message.reply("❌ Указанный канал не является голосовым.");
      return;
    }
    
    const voice_members = voice_channel.members;
    if (voice_members.size === 0) {
        await message.reply("👥 В аудитории никого нету.")
    }

    const all_users = await db.select().from(Users);
    const marked_students: string[] = [];

    for (const [, m] of voice_members) {
      const user = all_users.find((u) => u.discord_id === BigInt(m.id));

      if (user) {
        const today_visit = await db
          .select()
          .from(Visiting)
          .where(eq(Visiting.user_id, user.user_id));

        if (today_visit.length === 0) {
          await db.insert(Visiting).values({
            user_id: user.user_id,
            date_visit: new Date().toISOString().split("T")[0],
            status: "Присутствовал(а)",
          });

          const rating = (
            await db
              .select()
              .from(Rating)
              .where(eq(Rating.user_id, user.user_id))
          )[0];
          let new_points: number;
          if (rating) {
            new_points = Math.min(rating.ball! + POINTS_PER_VISIT, MAX_POINTS);
            await db
              .update(Rating)
              .set({ ball: new_points })
              .where(eq(Rating.user_id, user.user_id));
          } else {
            new_points = POINTS_PER_VISIT;
            await db.insert(Rating).values({
              user_id: user.user_id,
              ball: new_points,
            });
          }

          marked_students.push(
            `${user.full_name ?? "Неизвестный"}: ${new_points} балл(ов)\n`
          );
        }
      }
    }
    if (marked_students.length === 0) {
      await message.reply("ℹ️ Сегодня все студенты были отмечены.");
    } else {
      await message.reply(
        `✅ Отмечены студенты: (${
          marked_students.length
        }):\n ${marked_students.join("")}`
      );
    }
  },
};

export default mv;
