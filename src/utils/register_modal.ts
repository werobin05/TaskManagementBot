import {
  Client,
  Events,
  ModalBuilder,
  TextInputStyle,
  TextInputBuilder,
  ActionRowBuilder,
  MessageFlags,
} from "discord.js";
import { eq } from "drizzle-orm";
import { db } from "../database";
import { Users } from "../database/schema";

export function RegisterModal(client: Client) {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton() && interaction.customId === "register_button") {
      const modal = new ModalBuilder()
        .setCustomId("register_modal")
        .setTitle("Регистрация");

      const first_name_input = new TextInputBuilder()
        .setCustomId("first_name")
        .setLabel("Ваша фамилия")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const last_name_input = new TextInputBuilder()
        .setCustomId("last_name")
        .setLabel("Ваше имя")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const patronymic_input = new TextInputBuilder()
        .setCustomId("patronymic")
        .setLabel("Ваше отчество")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const course_input = new TextInputBuilder()
        .setCustomId("course")
        .setLabel("Введите номер курса")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Пример: 1 курс")
        .setRequired(true);

      const group_input = new TextInputBuilder()
        .setCustomId("group")
        .setLabel("Введите свой номер группы")
        .setPlaceholder("Пример: ИС221/1")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const row_1 = new ActionRowBuilder<TextInputBuilder>().addComponents(
        first_name_input
      );
      const row_2 = new ActionRowBuilder<TextInputBuilder>().addComponents(
        last_name_input
      );
      const row_3 = new ActionRowBuilder<TextInputBuilder>().addComponents(
        patronymic_input
      );
      const row_4 = new ActionRowBuilder<TextInputBuilder>().addComponents(
        course_input
      );
      const row_5 = new ActionRowBuilder<TextInputBuilder>().addComponents(
        group_input
      );

      modal.addComponents(row_1, row_2, row_3, row_4, row_5,);

      await interaction.showModal(modal);
    }

    if (
      interaction.isModalSubmit() &&
      interaction.customId === "register_modal"
    ) {
      const first_name = interaction.fields.getTextInputValue("first_name");
      const last_name = interaction.fields.getTextInputValue("last_name");
      const patronymic = interaction.fields.getTextInputValue("patronymic");
      const course = interaction.fields.getTextInputValue("course");
      const group = interaction.fields.getTextInputValue("group");
      const discord_id = BigInt(interaction.user.id);

      const existing_user = await db
        .select()
        .from(Users)
        .where(eq(Users.discord_id, discord_id));

      try {
        if (existing_user.length > 0) {
          await interaction.editReply({
            content: "⚠️ Вы уже зарегистрированы!",
          });
        } else {
          await db.insert(Users).values({
            discord_id: discord_id,
            first_name: first_name,
            last_name: last_name,
            patronymic: patronymic,
            course: course,
            group: group
          });

          await interaction.reply({
            content: "✅ Вы успешно зарегистрированы!",
            flags: 64,
          });
        }
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "⚠️ Вы уже зарегистрированы!",
          flags: 64,
        });
      }
    }
  });
}
