export type QuizQuestion = {
  id: string;
  week: number;
  type: "multiple_choice" | "true_false";
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

export function prepareQuiz(week: number, questions: QuizQuestion[], random = Math.random) {
  return shuffle(questions.filter((question) => question.week === week), random)
    .slice(0, 3)
    .map((question) => ({ ...question, options: shuffle(question.options, random) }));
}
