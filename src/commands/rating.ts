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
  name: "rating",
  description: "Таблица рейтинга",
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
        const sorted = ranting.sort(
          (a, b) => (b.scores ?? 0) - (a.scores ?? 0)
        );

        const headers = ["№", "Имя студента", "Группа", "Баллы"];
        const rows: string[][] = [];

        sorted.forEach((item, index) => {
          const full_name_lines = wrapText(item.full_name ?? "", MAX_COL_WIDTH);

          rows.push([
            (index + 1).toString(),
            item.full_name ?? "—",
            item.group ?? "—",
            item.scores?.toString() ?? "0",
          ]);

          for (let i = 1; i < full_name_lines.length; i++) {
            rows.push(["", full_name_lines[i]!, "", ""]);
          }

          rows.push(["-", "-", "-", "-"]);
        });

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
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  },
};

export default ranting;
