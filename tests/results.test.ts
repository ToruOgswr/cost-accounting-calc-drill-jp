import assert from "node:assert/strict";
import test from "node:test";
import questionData from "../data/questions.json" with { type: "json" };
import type { QuizQuestion } from "../lib/questions.ts";
import { calculateScore, summarizeStats } from "../lib/results.ts";

const questions = questionData.questions as QuizQuestion[];

test("回答の正答数をサーバー用ロジックで再計算する", () => {
  const selected = questions.filter((question) => question.week === 1).slice(0, 3);
  const answers = selected.map((question) => ({ id: question.id, answer: question.correctAnswer }));
  assert.equal(calculateScore(1, answers, questions), 3);
  answers[0].answer = "誤答";
  assert.equal(calculateScore(1, answers, questions), 2);
});

test("重複問題や別WEEKの問題を拒否する", () => {
  const selected = questions.filter((question) => question.week === 1).slice(0, 3);
  assert.equal(calculateScore(1, selected.map((question) => ({ id: selected[0].id, answer: question.correctAnswer })), questions), null);
  assert.equal(calculateScore(2, selected.map((question) => ({ id: question.id, answer: question.correctAnswer })), questions), null);
});

test("直近1時間の正答率を整数に丸める", () => {
  assert.deepEqual(summarizeStats(1, 2, 3), { percentage: 67, submissions: 1, correctCount: 2, questionCount: 3 });
  assert.deepEqual(summarizeStats(0, 0, 0), { percentage: null, submissions: 0, correctCount: 0, questionCount: 0 });
});
