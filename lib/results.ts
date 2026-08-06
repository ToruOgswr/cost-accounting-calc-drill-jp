import type { QuizQuestion } from "./questions";

export type SubmittedAnswer = { id: string; answer: string };

export function calculateScore(week: number, answers: SubmittedAnswer[], questions: QuizQuestion[]) {
  if (answers.length !== 3 || new Set(answers.map((answer) => answer.id)).size !== 3) return null;
  const selected = answers.map((answer) => questions.find((question) => question.id === answer.id && question.week === week));
  if (selected.some((question) => !question)) return null;
  return answers.reduce((total, answer, index) => total + (answer.answer === selected[index]!.correctAnswer ? 1 : 0), 0);
}

export function summarizeStats(submissions: number, correctCount: number, questionCount: number) {
  return { percentage: questionCount ? Math.round((correctCount / questionCount) * 100) : null, submissions, correctCount, questionCount };
}
