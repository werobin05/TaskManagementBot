import { db } from "../database";
import { Task } from "../database/schema";
import type { Command } from "../types/types";


const ranting: Command = {
  name: "ranting",
  description: "",
  async execute(message) {
    await message.reply("Таблица рейтинга!");
  },
};

export default ranting;