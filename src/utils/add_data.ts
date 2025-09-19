import {
  Client,
  Events,
  ModalBuilder,
  TextInputStyle,
  TextInputBuilder,
  ActionRowBuilder,
} from "discord.js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../database";
import { Users } from "../database/schema";

export function AddedDataModal(client: Client) {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton() && interaction.customId === "add_data") {
      const modal = new ModalBuilder()
        .setCustomId("add_account")
        .setTitle("Добавление данных");

      const login_input = new TextInputBuilder()
        .setCustomId("login")
        .setLabel("Придумайте логин")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const password_input = new TextInputBuilder()
        .setCustomId("password")
        .setLabel("Придумайте пароль")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const row_1 = new ActionRowBuilder<TextInputBuilder>().addComponents(
        login_input
      );
      const row_2 = new ActionRowBuilder<TextInputBuilder>().addComponents(
        password_input
      );
      modal.addComponents(row_1, row_2);

      await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === "add_account") {
      const Ilogin = interaction.fields.getTextInputValue("login");
      const Ipassword = interaction.fields.getTextInputValue("password");
      const discord_id = BigInt(interaction.user.id);

      const [user] = await db
        .select({
          login: Users.login,
          password: Users.password,
        })
        .from(Users)
        .where(eq(Users.discord_id, discord_id));

      if (!user) {
        return interaction.reply({
          content: "🚫 Профиль не найден",
          ephemeral: true,
        });
      }

      const has_login = user.login != null && user.login !== "";
      const has_password = user.password != null && user.password !== "";

      if (has_login && has_password) {
        return interaction.reply({
          content: "⚠️ Ты уже заполнил данные",
          ephemeral: true,
        });
      }

      const hashed = await bcrypt.hash(Ipassword, 20);
      await db
        .update(Users)
        .set({
          login: Ilogin,
          password: hashed,
        })
        .where(eq(Users.discord_id, discord_id));

      return interaction.reply({
        content: "✅ Данные успешно добавленны!",
        ephemeral: true,
      });
    }
  });
}
