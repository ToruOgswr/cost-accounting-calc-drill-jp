import assert from "node:assert/strict";
import test from "node:test";
import questionData from "../data/questions.json" with { type: "json" };
import { prepareQuiz, type QuizQuestion } from "../lib/questions.ts";

const questions = questionData.questions as QuizQuestion[];

test("WEEK1〜8にはそれぞれ3問以上ある", () => {
  for (let week = 1; week <= 8; week += 1) assert.ok(questions.filter((question) => question.week === week).length >= 3);
});

test("各WEEKから重複なしで3問をランダム選択する", () => {
  for (let week = 1; week <= 8; week += 1) {
    const quiz = prepareQuiz(week, questions, () => 0.42);
    assert.equal(quiz.length, 3);
    assert.equal(new Set(quiz.map((question) => question.id)).size, 3);
    assert.ok(quiz.every((question) => question.week === week));
  }
});

test("全問題に一意なID、選択肢内の正答、解説がある", () => {
  assert.equal(new Set(questions.map((question) => question.id)).size, questions.length);
  for (const question of questions) {
    assert.ok(question.prompt.trim());
    assert.ok(question.explanation.trim());
    assert.ok(question.options.includes(question.correctAnswer));
    assert.equal(question.options.length, question.type === "multiple_choice" ? 4 : 2);
  }
});
