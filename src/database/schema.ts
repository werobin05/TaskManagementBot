import { bigint, date, integer, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const task_status = pgEnum('status', ["done", "in process", "not feasible"]);

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
    created_at: timestamp('created_at').defaultNow()
});

export const UserTask = pgTable('UserTask', {
    task_id: integer('task_id').references(() => Task.task_id),
    user_id: integer('user_id').references(() => Users.user_id),
    name_task: varchar('name_task', { length: 100 }).notNull(),
    description_task: varchar('description_task', { length: 400 }),
    status: task_status(),
    created_at: timestamp('created_at', { mode: 'string' }).defaultNow(),
    complected_at: timestamp('complected_at', { mode: 'string' })
});
