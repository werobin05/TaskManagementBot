import { bigint, date, integer, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const task_status = pgEnum('task_status', ["Выполнена", "В процессе", "Не выполнена"]);
export const task_check_status = pgEnum('task_check_status', ["Завершена", "В процессе", "Не актуальна"]);
export const visit_status = pgEnum('visit_status', ["Присутствовал(а)", "Отсутствовал(а)"]);

export const Users = pgTable('Users', {
    user_id: integer('user_id').primaryKey().generatedAlwaysAsIdentity(),
    discord_id: bigint('discord_id', { mode: 'bigint' }),
    full_name: varchar('full_name', { length: 50 }).notNull(),
    group: varchar('group', { length: 10 }).notNull(),
    created_at: timestamp('created_at', { mode: 'string' }).defaultNow(),
});

export const Task = pgTable('Task', {
    task_id: integer('task_id').primaryKey().generatedAlwaysAsIdentity(),
    name_task: varchar('name_task', { length: 100 }).notNull(),
    description_task: varchar('description_task', { length: 400 }),
    deadline_task: date('deadline_task', { mode: "string"}),
    status: task_check_status().default("В процессе"),
    created_at: timestamp('created_at').defaultNow()
});

export const UserTask = pgTable('UserTask', {
    task_id: integer('task_id').references(() => Task.task_id),
    user_id: integer('user_id').references(() => Users.user_id),
    name_task: varchar('name_task', { length: 100 }).notNull(),
    description_task: varchar('description_task', { length: 400 }),
    status: task_status().default("В процессе"),
    created_at: timestamp('created_at', { mode: 'string' }).defaultNow(),
    complected_at: timestamp('complected_at', { mode: 'string' })
});

export const Visiting = pgTable('Visiting', {
    visit_id: integer('visit_id').primaryKey().generatedAlwaysAsIdentity(),
    user_id: integer('user_id').references(() => Users.user_id),
    date_visit: date('visit', { mode: 'date' }).defaultNow(),
    status: visit_status().default("Отсутствовал(а)")
})
