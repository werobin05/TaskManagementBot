import { db } from "../database";
import { Task } from "../database/schema";
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

const tasks: Command = {
  name: "tasks",
  description: "Отображает все задачи ",
  async execute(message) {
    const find_task = await db.select().from(Task);
    if (find_task.length === 0) {
      await message.reply("📋 Список пуст");
      return;
    }

    const headers = [
      "№",
      "Название задачи",
      "Описание задачи",
      "Статус",
      "Дедлайн",
    ];

    const rows: string[][] = [];
    for (const t of find_task) {
      const deadline = t.task_deadline
        ? new Date(t.task_deadline).toISOString().split("T")[0]
        : "Дедлайн не задан";
      const desc_lines = wrapText(t.task_desc ?? "", MAX_COL_WIDTH);

      rows.push([
        t.task_id.toString(),
        t.task_desc!,
        desc_lines[0] ?? "",
        t.task_status ?? "-",
        deadline!,
      ]);

      for (let i = 1; i < desc_lines.length; i++) {
        rows.push(["", "", desc_lines[i]!, "", ""]);
      }

      rows.push(["-", "-", "-", "-", "-"]);
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
  },
};

export default tasks;
