import {
  Client,
  Events,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { db } from "../database";
import { UserTask } from "../database/schema";
import { eq } from "drizzle-orm";

export function MyTaskAbout(client: Client) {
  const color = parseInt("37bd83", 16);
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "my_task") return;

    const ut_id = Number(interaction.values[0]);

    const my_task = await db
      .select()
      .from(UserTask)
      .where(eq(UserTask.ut_id, ut_id))
      .then((res) => res[0]);

    if (!my_task) {
      await interaction.reply({
        content: "⚠️ Задача не найдена",
        flags: 64,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`📌 ${my_task.task_name}`)
      .setColor(color)
      .setDescription(my_task.task_desc ?? "Описание отсуствует")
      .addFields(
        {
          name: "Статус выполнения",
          value: my_task.task_status ?? "-",
          inline: true,
        },
        { name: "Дедлайн", value: my_task.task_deadline ?? "-", inline: true },
        {
          name: "Баллы за задание",
          value: String(my_task.score ?? 0),
          inline: true,
        }
      )
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("back_to_task")
        .setLabel("⬅️ Назад")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId(`send_task_${my_task.ut_id}`)
        .setLabel("✅ Отправить на проверку")
        .setStyle(ButtonStyle.Success)
    );

    await interaction.reply({
        embeds: [embed],
        components: [row],
        flags: 64,
    })
  });
}
