import {
  Client,
  Events,
  ModalBuilder,
  TextInputStyle,
  TextInputBuilder,
  ActionRowBuilder,
} from "discord.js";
import { eq } from "drizzle-orm";
import { db } from "../database";
import { Users } from "../database/schema";

export function RegisterModal(client: Client) {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton() && interaction.customId === "register_button") {
      const modal = new ModalBuilder()
        .setCustomId("register_modal")
        .setTitle("Регистрация учебного профиля");

      const full_name_input = new TextInputBuilder()
        .setCustomId("full_name")
        .setLabel("Введите своё ФИО")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const group_input = new TextInputBuilder()
        .setCustomId("group")
        .setLabel("Введите свой номер группы")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const row_1 = new ActionRowBuilder<TextInputBuilder>().addComponents(
        full_name_input
      );
      const row_2 = new ActionRowBuilder<TextInputBuilder>().addComponents(
        group_input
      );

      modal.addComponents(row_1, row_2);

      await interaction.showModal(modal);
    }

    if (
      interaction.isModalSubmit() &&
      interaction.customId === "register_modal"
    ) {
      await interaction.deferReply({ flags: 64 });
      const full_name = interaction.fields.getTextInputValue("full_name");
      const group = interaction.fields.getTextInputValue("group");
      const discord_id = BigInt(interaction.user.id);

      const existing_user = await db
        .select()
        .from(Users)
        .where(eq(Users.discord_id, discord_id));

      try {
        if (existing_user.length > 0) {
          if (interaction.replied || interaction.deferred) {
            await interaction.editReply({
              content: "⚠️ Вы уже зарегистрированы!",
            });
          } else {
            await interaction.reply({
              content: "⚠️ Вы уже зарегистрированы!",
              flags: 64,
            });
          }
        } else {
          await db.insert(Users).values({
            discord_id: discord_id,
            full_name: full_name,
            group: group,
          });

          if (interaction.replied && interaction.deferred) {
            await interaction.editReply({
              content: "✅ Вы успешно зарегистрированы!",
            });
          } else {
            await interaction.reply({
              content: "✅ Вы успешно зарегистрированы!",
              flags: 64,
            });
          }
        }
      } catch (error) {
        console.error(error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: "⚠️ Вы уже зарегистрированы!",
            flags: 64,
          });
        }
      }
    }
  });
}
