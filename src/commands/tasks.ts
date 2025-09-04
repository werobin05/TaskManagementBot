import type { Command } from "../types/types";
import { db } from "../database";
import { Task } from "../database/schema";

const tasks: Command = {
  name: "tasks",
  description: "Отображает все задачи и их статус выполнения",
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
      "Дедлайн",
      "Дата создания",
    ];

    function formatDeadline(date?: string | Date | null) {
      if (!date) return "Дедлайн не задан"
    }

    const rows = find_task.map((t) => [
      t.task_id,
      t.name_task,
      t.description_task ?? "",
      t.deadline_task?.toString() ? new Date(t.deadline_task).toDateString() : "Дедлайн не задан",
      t.created_at?.toString() ? new Date(t.created_at).toDateString() : "",
    ]);
    const col_widths = headers.map((h, i) =>
      Math.max(
        h.length,
        ...rows.map((r) => (r[i] != null ? String(r[i]).length : 0))
      )
    );
    const format_rows = (row: string[]) =>
      row.map((cell, i) => cell.padEnd(col_widths[i]!)).join(" | ");

    let table = "```md\n";
    table += format_rows(headers) + "\n";
    table += col_widths.map((w) => "-".repeat(w)).join("-+-") + "\n";
    table += rows.map((r) => format_rows(r.map((cell) => String(cell)))).join("\n");
    table += "\n```";

    await message.reply(table);
  },
};

export default tasks;
