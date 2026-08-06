import type { Metadata } from "next";
import { notFound } from "next/navigation";
import questionData from "../../data/questions.json";
import { QuizApp } from "../QuizApp";
import type { QuizQuestion } from "../../lib/questions";

function parseWeek(value: string) {
  const match = /^week(0[1-8])$/.exec(value);
  return match ? Number(match[1]) : null;
}

export async function generateMetadata({ params }: { params: Promise<{ week: string }> }): Promise<Metadata> {
  const week = parseWeek((await params).week);
  return week ? { title: `原価計算｜WEEK${week} 計算論点ドリル`, description: `WEEK${week}の主要計算論点を3分で確認する小テスト` } : {};
}

export default async function WeekPage({ params }: { params: Promise<{ week: string }> }) {
  const week = parseWeek((await params).week);
  if (!week) notFound();
  return <QuizApp week={week} questions={questionData.questions as QuizQuestion[]} />;
}
