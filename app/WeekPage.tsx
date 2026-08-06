import questionData from "../data/questions.json";
import type { QuizQuestion } from "../lib/questions";
import { QuizApp } from "./QuizApp";

export function WeekPage({ week }: { week: number }) {
  return <QuizApp week={week} questions={questionData.questions as QuizQuestion[]} />;
}
