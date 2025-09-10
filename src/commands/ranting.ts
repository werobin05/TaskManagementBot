import { eq } from "drizzle-orm";
import { db } from "../database";
import { Users, Ranting } from "../database/schema";
import type { Command } from "../types/types";

const MAX_COL_WIDTH = 30;

function wrapText(text: string, width: number) {
  const lines: string[] = [];
  let start = 0;
  while (start < text.length) {
    lines.push(text.slice(start, start + width));
    start += width;
  }
  return lines;
}

const ranting: Command = {
  name: "ranting",
  description: "Отслеживание вашего рейтинг",
  async execute(message) {
    try {
      const ranting = await db
        .select({
          full_name: Users.full_name,
          group: Users.group,
          scores: Ranting.ball,
        })
        .from(Users)
        .leftJoin(Ranting, eq(Users.user_id, Ranting.user_id));
      if (ranting.length >= 1) {
        const headers = ["№", "Имя студента", "Группа", "Баллы"];

        const rows: string[][] = [];
        for (const list_ranting of ranting) {
          const full_name_lines = wrapText(
            list_ranting.full_name ?? "",
            MAX_COL_WIDTH
          );

          const max_list = Math.max(list_ranting.scores!)
          rows.push([
            max_list.toString(),
            list_ranting.full_name,
            list_ranting.group,
            list_ranting.scores?.toString()!,
          ]);

          for (let i = 1; i < full_name_lines.length; i++) {
            rows.push(["", full_name_lines[i]!, "", ""]);
          }

          rows.push(["-", "-", "-", "-"]);
        }

        const col_widths = headers.map((h, i) =>
          Math.max(
            h.length,
            ...rows.map((r) => (r[i] != null ? String(r[i]).length : 0))
          )
        );

        function format_row(row: string[]) {
          return row.map((cell, i) => cell.padEnd(col_widths[i]!)).join(" | ");
        }

        const separator = col_widths.map((w) => "-".repeat(w)).join("-+-");

        let table = "```md\n";
        table += format_row(headers) + "\n";
        table += separator + "\n";

        const formatted_rows = rows
          .map((r) => (r[0] === "-" ? separator : format_row(r)))
          .slice(0, -1);

        table += formatted_rows.join("\n");
        table += "\n```";

        await message.reply(table);
      } else {
        await message.reply("🏆 Рейтинг пуст");
        return;
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  },
};

export default ranting;
