import { getD1 } from "../../../db";
import questionData from "../../../data/questions.json";
import type { QuizQuestion } from "../../../lib/questions";
import { calculateScore, summarizeStats } from "../../../lib/results";

const HOUR_MS = 60 * 60 * 1000;
const WEEK_MS = 7 * 24 * HOUR_MS;
const questions = questionData.questions as QuizQuestion[];

export async function GET(request: Request) {
  const week = Number(new URL(request.url).searchParams.get("week"));
  if (!Number.isInteger(week) || week < 1 || week > 8) return Response.json({ error: "invalid week" }, { status: 400 });
  try {
    const db = getD1();
    const now = Date.now();
    await db.prepare("DELETE FROM quiz_attempts WHERE completed_at < ?").bind(now - WEEK_MS).run();
    const row = await db.prepare(`
      WITH recent AS (
        SELECT session_id, correct_count, question_count, completed_at
        FROM quiz_attempts
        WHERE week = ? AND completed_at >= ?
      ), first_times AS (
        SELECT session_id, MIN(completed_at) AS first_completed_at
        FROM recent GROUP BY session_id
      ), selected AS (
        SELECT r.correct_count, r.question_count
        FROM recent r JOIN first_times f
          ON r.session_id = f.session_id AND r.completed_at = f.first_completed_at
      )
      SELECT COUNT(*) AS submissions,
             COALESCE(SUM(correct_count), 0) AS correct_count,
             COALESCE(SUM(question_count), 0) AS question_count
      FROM selected
    `).bind(week, now - HOUR_MS).first<{ submissions: number; correct_count: number; question_count: number }>();
    const submissions = Number(row?.submissions ?? 0);
    const correctCount = Number(row?.correct_count ?? 0);
    const questionCount = Number(row?.question_count ?? 0);
    return Response.json(summarizeStats(submissions, correctCount, questionCount));
  } catch {
    return Response.json({ error: "statistics unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { sessionId?: string; week?: number; startedAt?: number; answers?: Array<{ id: string; answer: string }> };
    const now = Date.now();
    if (!body.sessionId || body.sessionId.length > 100 || !Number.isInteger(body.week) || body.week! < 1 || body.week! > 8 || !Array.isArray(body.answers) || body.answers.length !== 3) {
      return Response.json({ error: "invalid submission" }, { status: 400 });
    }
    const correctCount = calculateScore(body.week!, body.answers, questions);
    if (correctCount === null) return Response.json({ error: "invalid questions" }, { status: 400 });
    const startedAt = Number(body.startedAt);
    const durationSeconds = Number.isFinite(startedAt) ? Math.max(0, Math.min(180, Math.round((now - startedAt) / 1000))) : 180;
    const db = getD1();
    await db.batch([
      db.prepare("DELETE FROM quiz_attempts WHERE completed_at < ?").bind(now - WEEK_MS),
      db.prepare("INSERT INTO quiz_attempts (id, session_id, week, correct_count, question_count, duration_seconds, completed_at) VALUES (?, ?, ?, ?, 3, ?, ?)")
        .bind(crypto.randomUUID(), body.sessionId, body.week, correctCount, durationSeconds, now),
    ]);
    return Response.json({ saved: true, correctCount });
  } catch {
    return Response.json({ error: "submission unavailable" }, { status: 503 });
  }
}
