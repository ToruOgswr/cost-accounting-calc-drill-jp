export default function Home() {
  return <main className="landing">
    <section className="hero">
      <p className="eyebrow">COST ACCOUNTING · WEEK 01–08</p>
      <h1>原価計算<br /><em>理解度確認クイズ</em></h1>
      <p className="lead">WEEKを選択すると、3分間の小テストが始まります。</p>
      <div className="weekGrid">
        {Array.from({ length: 8 }, (_, index) => index + 1).map((week) => <a className="weekLink" href={`/week${String(week).padStart(2, "0")}`} key={week}>WEEK{week}</a>)}
      </div>
    </section>
  </main>;
}
