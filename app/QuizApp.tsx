"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { prepareQuiz, type QuizQuestion } from "../lib/questions";

type Screen = "top" | "quiz" | "result";
const LIMIT_SECONDS = 180;

export function QuizApp({ week, questions }: { week: number; questions: QuizQuestion[] }) {
  const [screen, setScreen] = useState<Screen>("top");
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remaining, setRemaining] = useState(LIMIT_SECONDS);
  const answersRef = useRef<Record<string, string>>({});
  const startedAtRef = useRef(0);
  const deadlineRef = useRef(0);
  const finishedRef = useRef(false);
  const current = quiz[index];
  const lockedAnswer = current ? answers[current.id] : undefined;
  const score = quiz.filter((question) => answers[question.id] === question.correctAnswer).length;

  const complete = useCallback((finalAnswers: Record<string, string>) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setAnswers(finalAnswers);
    setScreen("result");
  }, []);

  useEffect(() => {
    if (screen !== "quiz") return;
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0) complete(answersRef.current);
    };
    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [complete, screen]);

  function start() {
    const prepared = prepareQuiz(week, questions);
    if (prepared.length !== 3) return;
    const now = Date.now();
    startedAtRef.current = now;
    deadlineRef.current = now + LIMIT_SECONDS * 1000;
    answersRef.current = {};
    finishedRef.current = false;
    setQuiz(prepared); setIndex(0); setSelected(""); setAnswers({}); setRemaining(LIMIT_SECONDS); setScreen("quiz");
  }

  function lockAnswer() {
    if (!current || !selected || lockedAnswer) return;
    const nextAnswers = { ...answersRef.current, [current.id]: selected };
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);
  }

  function next() {
    if (index === quiz.length - 1) { complete(answersRef.current); return; }
    setIndex((value) => value + 1); setSelected("");
  }

  function returnTop() { setScreen("top"); setQuiz([]); setAnswers({}); setSelected(""); }
  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, "0");

  return <main className="appShell">
    <header className="siteHeader"><div className="brandMark">Σ</div><div><b>原価計算</b><small>CALCULATION DRILL</small></div></header>
    {screen === "top" && <section className="topCard">
      <p className="eyebrow">COST ACCOUNTING</p>
      <h1>WEEK{week}<br /><em>計算論点ドリル</em></h1>
      <p className="lead">ランダムに3問出題します。制限時間は3分です。</p>
      <button className="primary" onClick={start}>3分ドリルを始める</button>
    </section>}

    {screen === "quiz" && current && <section className="quizPanel">
      <div className="quizMeta"><span>WEEK{week}</span><strong className={remaining <= 30 ? "urgent" : ""}>残り {minutes}:{seconds}</strong><span>{index + 1}/3</span></div>
      <div className="progress"><i style={{ width: `${(remaining / LIMIT_SECONDS) * 100}%` }} /></div>
      <article className="questionCard">
        <p className="questionType">{current.type === "multiple_choice" ? "四択問題" : "正誤問題"}</p>
        <h1>{current.prompt}</h1>
        <fieldset disabled={Boolean(lockedAnswer)}><legend>回答を選択してください</legend>
          <div className="options">{current.options.map((option, optionIndex) => <label className={selected === option ? "selected" : ""} key={option}><input type="radio" name="answer" checked={selected === option} onChange={() => setSelected(option)} /><b>{current.type === "multiple_choice" ? optionIndex + 1 : optionIndex === 0 ? "○" : "×"}</b><span>{option}</span></label>)}</div>
        </fieldset>
        {!lockedAnswer ? <button className="primary" disabled={!selected} onClick={lockAnswer}>回答を確定する</button> : <div className={lockedAnswer === current.correctAnswer ? "feedback correct" : "feedback incorrect"}>
          <h2>{lockedAnswer === current.correctAnswer ? "正解です" : "不正解です"}</h2>
          <p>正解：<strong>{current.correctAnswer}</strong></p><p>{current.explanation}</p>
          <button className="primary" onClick={next}>{index === 2 ? "結果を見る" : "次の問題へ"}</button>
        </div>}
      </article>
    </section>}

    {screen === "result" && <section className="resultCard">
      <p className="eyebrow">WEEK{week} · COMPLETE</p>
      <h1>結果は <em>{score}/3</em></h1>
      <p>{remaining === 0 ? "制限時間が終了しました。" : "3問の回答が完了しました。"}</p>
      <div className="resultRows">{quiz.map((question, questionIndex) => <div key={question.id}><span>{questionIndex + 1}</span><p>{question.prompt}</p><b className={answers[question.id] === question.correctAnswer ? "ok" : "ng"}>{answers[question.id] === question.correctAnswer ? "正解" : "不正解"}</b></div>)}</div>
      <p className="saveStatus">回答はこの端末内だけで処理し、保存・送信しません。</p>
      <button className="primary" onClick={returnTop}>トップへ戻る</button>
    </section>}
  </main>;
}
