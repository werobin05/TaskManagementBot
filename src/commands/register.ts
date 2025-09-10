import type { Command } from "../types/types";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

const register: Command = {
  name: "register",
  description: "Регистрация пользователя через модальное окно",
  async execute(message) {
    const button_reg = new ButtonBuilder()
      .setCustomId("register_button")
      .setLabel("Регистрация")
      .setStyle(ButtonStyle.Primary);

    const row_1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      button_reg
    );
    await message.reply({
      content:
        "Привет! Прежде чем зарегистрироваться прочтите <#1412444866243330060>, после перейдите <#1412400123798884462>",
      components: [row_1],
    });
  },
};

export default register;
