import path from "path";
import dotenv from "dotenv";
import { readdirSync } from "fs";
import { pathToFileURL } from "url";
import { fileURLToPath } from "url";
import type { Command } from "./types/types";
import { RegisterModal } from "./utils/register_modal";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { AddedDataModal } from "./utils/add_data";

dotenv.config();

const PREFIX = "?";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commands_path = path.join(__dirname, "commands");

export async function InitBot() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });
  client.on(Events.ClientReady, async (ready_client) => {
    console.log(`Logged in as ${ready_client.user.tag}`);
    RegisterModal(client);
    AddedDataModal(client);
  });
  const commands = new Map<string, Command>();
  
  for (const file of readdirSync(commands_path)) {
    if (file === "types.ts" || file === "types.js") continue;
    if (file.endsWith(".ts") || file.endsWith(".js")) {
      const file_path = path.join(commands_path, file);
      const command_module = await import(pathToFileURL(file_path).href);
      const command: Command = command_module.default;
      
      if (!command?.name || !command?.execute) {
        console.warn(`❌ Команда в файле ${file} невалидна`);
        continue;
      }
      commands.set(command.name, command);
    }
  }

  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const command_name = args.shift()?.toLocaleLowerCase();
    if (!command_name) return;

    const command = commands.get(command_name);
    if (!command) {
      await message.reply('❌ Данной команды не существует');
      return;
    }

    try {
      await command.execute(message, args, commands);
    } catch (err) {
      console.log(err);
      await message.reply("⚠️ Ошибка при выполнении команды.")
    }
  });

  await client.login(process.env.TOKEN);
}
