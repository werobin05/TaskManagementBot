import {
  bigint,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const task_status = pgEnum("task_status", [
  "Выполнена",
  "В процессе",
  "Не выполнена",
]);
export const user_task_status = pgEnum("user_task_status", [
  "Завершена",
  "В процессе",
  "Не актуальна",
]);
export const visit_status = pgEnum("visit_status", [
  "Присутствовал(а)",
  "Отсутствовал(а)",
]);

export const media_type_lsit = pgEnum("media_type", [
  "image",
  "video",
  "audio",
  "pdf",
])

export const Users = pgTable("Users", {
  user_id: integer("user_id").primaryKey().generatedAlwaysAsIdentity(),
  discord_id: bigint("discord_id", { mode: "bigint" }),
  first_name: varchar("first_name", { length: 40 }).notNull(),
  last_name: varchar("last_name", { length: 40 }).notNull(),
  patronymic: varchar("patronymic", { length: 40 }).notNull(),
  login: varchar("login", { length: 50 }),
  password: text("password"),
  course: varchar("course", { length: 10 }).notNull(),
  group: varchar("group", { length: 10 }).notNull(),
  created_at: timestamp("created_at", { mode: "string" }).defaultNow(),
});

export const Task = pgTable("Task", {
  task_id: integer("task_id").primaryKey().generatedAlwaysAsIdentity(),
  rating_id: integer("rating_id").references(() => Rating.rank_id),
  task_name: varchar("name_task", { length: 100 }).notNull(),
  task_desc: varchar("description_task", { length: 400 }),
  task_status: task_status().default("В процессе"),
  task_deadline: date("task_deadline", { mode: "string"}).defaultNow(),
  score: numeric("score", { precision: 4, scale: 2, mode: "number" }).default(0.00),
  created_at: timestamp("created_at", { mode: "string" }).defaultNow(),
});

export const UserTask = pgTable("UserTask", {
  ut_id: integer("ut_id").primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer("user_id").references(() => Users.user_id),
  task_name: varchar("name_task", { length: 100 }).notNull(),
  task_desc: varchar("description_task", { length: 400 }),
  task_status: task_status().default("В процессе"),
  task_deadline: date("task_deadline", { mode: "string"}).defaultNow(),
  score: numeric("score", { precision: 4, scale: 2, mode: "number" }).default(0.00),
  created_at: timestamp("created_at", { mode: "string" }).defaultNow(),
});

export const Visiting = pgTable("Visiting", {
  visit_id: integer("visit_id").primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer("user_id").references(() => Users.user_id),
  date_visit: date("date_visit", { mode: "string" }).defaultNow(),
  status: visit_status().default("Отсутствовал(а)"),
});

export const Rating = pgTable("Rating", {
  rank_id: integer("rank_id").primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer("user_id").references(() => Users.user_id),
  ball: numeric("ball", { precision: 10, scale: 2, mode: "number" }).default(
    0.00
  ),
});

export const Schedule = pgTable("Schedule", {
  schedule_id: integer("schedule_id").primaryKey().generatedAlwaysAsIdentity(),
  schedule_date: date("schedule_date", { mode: "string" }),
  created_at: timestamp("created_at", { mode: "string" }).defaultNow()
});

export const Lesson = pgTable("Lessons", {
  lesson_id: integer("lesson_id").primaryKey().generatedAlwaysAsIdentity(),
  schedule_id: integer("schedule_id").references(() => Schedule.schedule_id),
  rank_id: integer("rating_id").references(() => Rating.rank_id),
  lesson_name: varchar("lesson_name", { length: 200 }),
  score: numeric("score", { precision: 4, scale: 2, mode: "number" }).default(0.00),
});

export const Lecture = pgTable("Lecture", {
  lecture_id: integer("lecture_id").primaryKey().generatedAlwaysAsIdentity(),
  lesson_id: integer("lesson_id").references(() => Lesson.lesson_id),
  lecture_name: varchar("lecture_name", { length: 250 }).notNull(),
  content: text("content"),
  created_at: timestamp("created_at", { mode: "string" }).defaultNow()
});

export const LectureMedia = pgTable("LectureName", {
  media_id: integer("media_id").primaryKey().generatedAlwaysAsIdentity(),
  lecture_id: integer("lecture_id").references(() => Lecture.lecture_id),
  file_url: varchar("file_url", { length: 500 }).notNull(),
  media_type: media_type_lsit(),
  created_at: timestamp("created_at", { mode: "string" }).defaultNow()
});