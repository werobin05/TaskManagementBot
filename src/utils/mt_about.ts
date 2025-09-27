import {
  Client,
  Events,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";
import dotenv from "dotenv";
import { db } from "../database";
import { eq } from "drizzle-orm";
import MyTask from "../commands/my_task";
import { UserTask } from "../database/schema";
import { channel } from "diagnostics_channel";

dotenv.config();

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
    });
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "back_to_task") {
      const fake_message = interaction.message;
      await MyTask.execute(fake_message as any, []);
      await interaction.deferUpdate();
    }
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
      if (interaction.customId.startsWith("send_task_")) {
        const ut_id = interaction.customId.startsWith("send_task_");
        await interaction.deferReply({ flags: 64 });
        const guild = interaction.guild;
        if (!guild) return;

        const user = interaction.user;
        const teacher_id = process.env.TEACHER_ID;
        const category_id = process.env.CATEGORY_ID;

        let channel = guild.channels.cache.find(
          (ch) =>
            ch.type === ChannelType.GuildText &&
            ch.parentId === category_id &&
            ch.name === `Проверка-${user.username.toLowerCase}`
        );

        if (!channel) {
          channel = await guild.channels.create({
            name: `Проверка-${user.username}`,
            type: ChannelType.GuildText,
            parent: category_id,
            permissionOverwrites: [
              {
                id: guild.roles.everyone,
                deny: [PermissionFlagsBits.ViewChannel],
              },
              {
                id: user.id,
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.SendMessages,
                ],
              },
              {
                id: teacher_id!,
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.SendMessages,
                ],
              },
              {
                id: guild.members.me!.id,
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.SendMessages,
                ],
              },
            ],
          });
        }
        const embed = new EmbedBuilder()
          .setTitle("🔎 Задание на проверку")
          .setColor(color)
          .addFields(
            {
              name: "Студент",
              value: `${user.username}`,
              inline: true,
            },
            {
              name: "Задача",
              value: interaction.message.embeds[0]?.title ?? "???",
              inline: true,
            },
            {
              name: "Описание",
              value:
                interaction.message.embeds[0]?.description ??
                "Описание отсуствует",
              inline: false,
            }
          )
          .setTimestamp();

        if (channel?.isTextBased()) {
          await channel.send({ embeds: [embed] });
        }
        await interaction.editReply({
          content: `Задача #${ut_id} успешно отправлена на проверку ✅`,
        });
      }
    }
  });
}
