import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sourcePath = path.join(root, "SOURCE/week01-08_計算論点問題_レビュー用統合版.md");
const outputPath = path.join(root, "data/questions.json");
const markdown = await readFile(sourcePath, "utf8");
const questions = [];
let week = 0;
let type = "";
const lines = markdown.split(/\r?\n/);

for (let index = 0; index < lines.length; index += 1) {
  const weekMatch = /^## WEEK([1-8])$/.exec(lines[index]);
  if (weekMatch) { week = Number(weekMatch[1]); continue; }
  if (lines[index].startsWith("### 四択問題")) { type = "multiple_choice"; continue; }
  if (lines[index].startsWith("### 正誤問題")) { type = "true_false"; continue; }
  const questionMatch = /^#### (四択|正誤) (Q\d+-\d+)$/.exec(lines[index]);
  if (!questionMatch) continue;
  const sourceId = questionMatch[2];
  const body = [];
  index += 1;
  while (index < lines.length && !/^#{2,4} /.test(lines[index])) { body.push(lines[index]); index += 1; }
  index -= 1;
  const prompt = body.find((line) => line.trim() && !/^(\d+\.|- |\*\*)/.test(line))?.trim();
  if (!prompt) throw new Error(`${sourceId}: 問題文がありません。`);
  const options = type === "multiple_choice"
    ? body.filter((line) => /^\d+\. /.test(line)).map((line) => line.replace(/^\d+\. /, "").trim())
    : ["適切である", "不適切である"];
  const answerLine = body.find((line) => line.startsWith("**正答："));
  const explanationLine = body.find((line) => line.startsWith("**解説：**"));
  if (!answerLine || !explanationLine) throw new Error(`${sourceId}: 正答または解説がありません。`);
  let correctAnswer;
  if (type === "multiple_choice") {
    const answerNumber = Number(/^\*\*正答：(\d)/.exec(answerLine)?.[1]);
    correctAnswer = options[answerNumber - 1];
  } else {
    correctAnswer = answerLine.includes("不適切である") ? "不適切である" : "適切である";
  }
  if (!correctAnswer || options.length !== (type === "multiple_choice" ? 4 : 2)) throw new Error(`${sourceId}: 選択肢または正答を解釈できません。`);
  questions.push({ id: `week${String(week).padStart(2, "0")}-${type === "multiple_choice" ? "mc" : "tf"}-${sourceId.toLowerCase()}`, week, type, prompt, options, correctAnswer, explanation: explanationLine.replace("**解説：**", "").trim() });
}

for (let value = 1; value <= 8; value += 1) {
  if (questions.filter((question) => question.week === value).length < 3) throw new Error(`WEEK${value}: 3問未満です。`);
}
if (new Set(questions.map((question) => question.id)).size !== questions.length) throw new Error("問題IDが重複しています。");

await writeFile(outputPath, `${JSON.stringify({ schemaVersion: "1.0", source: path.basename(sourcePath), questions }, null, 2)}\n`, "utf8");
console.log(`Generated ${questions.length} questions.`);
