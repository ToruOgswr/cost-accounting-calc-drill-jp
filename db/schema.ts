import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const quizAttempts = sqliteTable("quiz_attempts", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  week: integer("week").notNull(),
  correctCount: integer("correct_count").notNull(),
  questionCount: integer("question_count").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  completedAt: integer("completed_at").notNull(),
}, (table) => [
  index("idx_quiz_attempts_week_completed_at").on(table.week, table.completedAt),
  index("idx_quiz_attempts_session_week_completed_at").on(table.sessionId, table.week, table.completedAt),
]);
