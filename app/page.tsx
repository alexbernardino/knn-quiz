"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CircleHelp, ExternalLink, RotateCcw, Sparkles, X } from "lucide-react";

type Question = {
  category: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  experiment: string;
  visual: "boundary" | "overlap" | "samples" | "matrix" | "imbalance" | "split" | "weighted" | "consistency" | "resampling" | "tradeoff";
};

const questions: Question[] = [
  { category: "K and the boundary", visual: "boundary", prompt: "What usually happens when K is reduced from 15 to 1?", options: ["The boundary becomes smoother and predictor variance decreases", "The boundary becomes more irregular and predictor variance increases", "The training data no longer influence the prediction", "Precision and accuracy must both increase"], answer: 1, explanation: "With K = 1, each prediction follows one nearby sample. Small changes in the training set can therefore move the boundary substantially: this is high predictor variance.", experiment: "Keep the data fixed and compare K = 1 with K = 15. Then resample several times." },
  { category: "Class overlap", visual: "overlap", prompt: "You move the two Gaussian means closer together. What should you expect?", options: ["More overlap and usually lower test accuracy", "Less overlap and always perfect precision", "No change because KNN ignores feature values", "A straighter boundary with guaranteed higher recall"], answer: 0, explanation: "Closer distributions create more intrinsically ambiguous observations. Even a good classifier cannot remove uncertainty that is present in the data-generating process.", experiment: "Move the green and red means toward each other while leaving K and the covariances unchanged." },
  { category: "Sample size", visual: "samples", prompt: "At fixed distributions and K, what is the usual effect of collecting more training points?", options: ["The fitted boundary tends to become more stable across resamples", "The classifier becomes independent of K", "Test accuracy must become exactly 100%", "Predictor variance must increase"], answer: 0, explanation: "A larger training sample gives a more reliable picture of the local class probabilities. The boundary generally varies less from one random sample to another.", experiment: "Compare repeated samples with 20 points per class and 200 points per class." },
  { category: "Precision", visual: "matrix", prompt: "Green is the positive class. If TP = 18 and FP = 6, what is green-class precision?", options: ["18 / (18 + 6) = 75%", "18 / (18 + 6) = 25%", "18 / (18 + FN)", "6 / (18 + 6) = 75%"], answer: 0, explanation: "Precision asks: among points predicted green, what fraction truly are green? Therefore precision = TP / (TP + FP) = 18 / 24 = 75%.", experiment: "Watch how TP and FP change when K changes, then recompute precision from the confusion matrix." },
  { category: "Class imbalance", visual: "imbalance", prompt: "A dataset has 95 red and 5 green test points. A classifier predicts every point as red. Which statement is best?", options: ["95% accuracy proves it is an excellent classifier", "It has high accuracy but completely fails to detect the green class", "Its green precision is 95%", "Its confusion matrix is unnecessary"], answer: 1, explanation: "Accuracy can hide failure on a rare class. The confusion matrix and class-specific precision and recall reveal what the single percentage conceals.", experiment: "Use very different class sizes and inspect accuracy together with every confusion-matrix cell." },
  { category: "Train / test split", visual: "split", prompt: "With a fixed total dataset, what can happen when the test fraction rises from 20% to 50%?", options: ["Both training and test sets become larger", "The accuracy estimate uses more test points, but the fitted classifier has fewer training points", "K automatically increases", "Predictor variance must become zero"], answer: 1, explanation: "A larger test set can make measured performance less noisy, but it leaves fewer examples for learning. That can make the fitted KNN predictor less stable.", experiment: "Hold the total point count fixed and compare several random splits at 20% and 50% test fractions." },
  { category: "Distance weighting", visual: "weighted", prompt: "For K = 7, four green neighbours are far away and three red neighbours are extremely close. What may inverse-distance voting do?", options: ["It must predict green because four is larger than three", "It may predict red because close neighbours receive more weight", "It ignores all seven neighbours", "It produces the same result as majority voting in every case"], answer: 1, explanation: "Uniform voting counts neighbours equally. Inverse-distance voting can let a smaller group of very close neighbours outweigh a larger group of distant ones.", experiment: "Place a query near three red points but inside a wider group of four green points, then toggle voting mode." },
  { category: "Consistency", visual: "consistency", prompt: "In statistical learning, what does consistency of an estimator broadly mean?", options: ["It returns exactly the same boundary for every finite sample", "Its learned predictor or risk approaches the target optimum as the sample grows, under suitable conditions", "It always uses a fixed K", "Its training accuracy is always 100%"], answer: 1, explanation: "Consistency is an asymptotic idea: with increasingly informative data and appropriate settings, estimation error shrinks toward the desired population target. It does not mean identical finite-sample answers.", experiment: "Increase the sample size in stages and compare the spread of boundaries over repeated resampling." },
  { category: "Predictor variance", visual: "resampling", prompt: "Repeatedly resampling a small dataset makes the K = 1 boundary move widely. What does this demonstrate?", options: ["High predictor variance", "Low predictor variance", "High precision by definition", "Zero irreducible error"], answer: 0, explanation: "Predictor variance measures sensitivity to the particular training sample. Large boundary changes under resampling are direct visual evidence of high variance.", experiment: "Set K = 1, resample repeatedly, then increase K and compare how much the boundary moves." },
  { category: "Bias–variance trade-off", visual: "tradeoff", prompt: "Why can choosing a very large K hurt performance?", options: ["It makes every distance exactly zero", "It can oversmooth local structure: variance falls, but bias rises", "It always increases both precision and recall", "It turns KNN into linear regression"], answer: 1, explanation: "A larger neighbourhood averages away sample noise, reducing variance. But too much averaging can erase real local class structure, increasing bias and harming minority regions.", experiment: "Use overlapping or unequal classes and trace test accuracy across odd K values." },
];

function MiniVisual({ type }: { type: Question["visual"] }) {
  const dots = [[32,36],[54,62],[78,43],[112,72],[148,48],[179,75],[205,39]];
  return <svg className="mini-visual" viewBox="0 0 240 112" aria-label={`${type} concept illustration`}>
    <rect width="240" height="112" rx="12" fill="#f2efe7" />
    {type === "matrix" ? <><text x="78" y="25">Predicted</text><rect x="53" y="35" width="64" height="30" fill="#ccebdd"/><rect x="119" y="35" width="64" height="30" fill="#f4d5d1"/><rect x="53" y="67" width="64" height="30" fill="#f4d5d1"/><rect x="119" y="67" width="64" height="30" fill="#ccebdd"/><text x="78" y="55">TP 18</text><text x="140" y="55">FP 6</text><text x="78" y="87">FN</text><text x="140" y="87">TN</text></> :
    type === "tradeoff" ? <><path d="M22 91 C55 20 90 18 121 72 C150 112 191 76 218 25" fill="none" stroke="#315fc7" strokeWidth="4"/><text x="18" y="24">error</text><text x="179" y="103">K →</text></> :
    type === "split" ? <><rect x="20" y="27" width="120" height="58" rx="8" fill="#315fc7"/><rect x="143" y="27" width="77" height="58" rx="8" fill="#d8f154"/><text x="56" y="61" fill="white">TRAIN</text><text x="161" y="61">TEST</text></> :
    type === "consistency" || type === "resampling" ? <><path d="M14 84 C50 27 75 97 113 45 S176 70 226 28" fill="none" stroke="#cf4d45" strokeWidth="2" opacity=".55"/><path d="M14 74 C51 38 77 85 112 49 S174 65 226 34" fill="none" stroke="#178464" strokeWidth="2" opacity=".65"/><path d="M14 66 C50 46 80 76 113 52 S180 58 226 39" fill="none" stroke="#315fc7" strokeWidth="3"/></> :
    <>{dots.map(([x,y],i)=><g key={i}>{i%2===0?<circle cx={x} cy={y} r="7" fill="#178464"/>:<rect x={x-7} y={y-7} width="14" height="14" fill="#cf4d45"/>}</g>)}<path d={type === "boundary" ? "M8 91 C52 21 89 95 126 40 S193 88 232 19" : "M12 93 C73 76 88 20 137 57 S194 62 229 17"} fill="none" stroke="#315fc7" strokeWidth="4"/>{type === "weighted" && <circle cx="110" cy="56" r="35" fill="none" stroke="#172139" strokeDasharray="4 4"/>}</>}
  </svg>;
}

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [finished, setFinished] = useState(false);
  const answersRef = useRef(answers);
  const currentRef = useRef(current);
  useEffect(() => { answersRef.current = answers; currentRef.current = current; }, [answers, current]);

  const score = useMemo(() => answers.reduce<number>((n, answer, i) => n + (answer === questions[i].answer ? 1 : 0), 0), [answers]);
  const question = questions[current];
  const choice = answers[current];

  function choose(index: number) {
    setAnswers((previous) => previous.map((value, i) => i === current && value === null ? index : value));
  }
  function restart() { setAnswers(Array(questions.length).fill(null)); setCurrent(0); setFinished(false); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function next() { if (current === questions.length - 1) setFinished(true); else setCurrent((n) => n + 1); }

  useEffect(() => {
    const modelContext = (document as Document & { modelContext?: { registerTool?: (tool: unknown, options?: unknown) => void } }).modelContext;
    if (!modelContext?.registerTool) return;
    const controller = new AbortController();
    const settle = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    try {
      modelContext.registerTool({ name: "answer_knn_quiz_question", description: "Answer one KNN quiz question and show its immediate feedback.", inputSchema: { type: "object", properties: { questionNumber: { type: "integer", minimum: 1, maximum: 10 }, choiceIndex: { type: "integer", minimum: 0, maximum: 3 } }, required: ["questionNumber", "choiceIndex"] }, execute: async ({ questionNumber, choiceIndex }: { questionNumber: number; choiceIndex: number }) => { const i = questionNumber - 1; setCurrent(i); setFinished(false); setAnswers((old) => old.map((v, j) => j === i && v === null ? choiceIndex : v)); await settle(); return { questionNumber, correct: choiceIndex === questions[i].answer, explanation: questions[i].explanation }; } }, { signal: controller.signal });
      modelContext.registerTool({ name: "restart_knn_quiz", description: "Restart the KNN quiz from question one.", inputSchema: { type: "object", properties: {} }, execute: async () => { restart(); await settle(); return { status: "restarted" }; } }, { signal: controller.signal });
      modelContext.registerTool({ name: "read_knn_quiz_progress", description: "Read current KNN quiz progress and score.", inputSchema: { type: "object", properties: {} }, annotations: { readOnlyHint: true }, execute: async () => ({ currentQuestion: currentRef.current + 1, answered: answersRef.current.filter((a) => a !== null).length, score: answersRef.current.reduce<number>((n, a, i) => n + (a === questions[i].answer ? 1 : 0), 0), total: questions.length }) }, { signal: controller.signal });
    } catch { return; }
    return () => controller.abort();
  }, []);

  if (finished) {
    const percent = Math.round(score / questions.length * 100);
    return <main className="quiz-shell"><Header/><section className="results">
      <p className="eyebrow">Quiz complete</p><div className="score-ring" style={{"--score": `${percent * 3.6}deg`} as React.CSSProperties}><span>{percent}%</span></div>
      <h2>{score} out of {questions.length} correct</h2><p>{percent >= 80 ? "Strong work — you are reasoning about both performance and stability." : percent >= 60 ? "Good foundation. Review the explanations, especially consistency and variance." : "Use the experiments to connect each idea to what the boundary actually does."}</p>
      <div className="result-actions"><button className="secondary" onClick={() => { setFinished(false); setCurrent(0); }}>Review answers</button><button className="primary" onClick={restart}><RotateCcw size={16}/>Restart quiz</button></div>
      <a className="demo-link" href="https://alexbernardino.github.io/knn-interactive/" target="_blank" rel="noreferrer">Continue experimenting in KNN Interactive <ExternalLink size={15}/></a>
    </section><Footer/></main>;
  }

  return <main className="quiz-shell"><Header/>
    <section className="quiz-layout">
      <aside className="lesson-rail"><p className="eyebrow">Learning path</p><h2>Reason from what you see</h2>
        <ul><li className={current < 3 ? "active" : ""}><span>01</span>K and the data</li><li className={current >= 3 && current < 7 ? "active" : ""}><span>02</span>Performance</li><li className={current >= 7 ? "active" : ""}><span>03</span>Consistency & variance</li></ul>
        <div className="rail-note"><Sparkles size={18}/><p>Answer first, then run the suggested experiment in the live demo.</p></div>
      </aside>
      <section className="question-stage"><div className="progress-row"><span>Question {current + 1} of {questions.length}</span><div className="progress-track"><div style={{width: `${(current + 1) * 10}%`}}/></div><strong>{score} point{score === 1 ? "" : "s"}</strong></div>
        <article className="question-card"><div className="question-top"><div><div className="question-label"><CircleHelp size={18}/>{question.category}</div><h2>{question.prompt}</h2></div><MiniVisual type={question.visual}/></div>
          <div className="answers" role="radiogroup" aria-label="Answer choices">{question.options.map((option,index)=>{const revealed=choice!==null; const isCorrect=index===question.answer; const selected=choice===index; return <button key={option} type="button" disabled={revealed} className={`${selected ? "selected" : ""} ${revealed && isCorrect ? "answer-correct" : ""} ${revealed && selected && !isCorrect ? "answer-wrong" : ""}`} aria-pressed={selected} onClick={()=>choose(index)}><span>{revealed && isCorrect ? <Check size={15}/> : revealed && selected ? <X size={15}/> : String.fromCharCode(65+index)}</span>{option}</button>})}</div>
          {choice!==null && <div className={`feedback ${choice===question.answer ? "correct" : "incorrect"}`} aria-live="polite"><div className="feedback-icon">{choice===question.answer ? <Check size={16}/> : <X size={16}/>}</div><div><strong>{choice===question.answer ? "Correct." : "Not quite."}</strong><p>{question.explanation}</p><div className="try-it"><b>Try it:</b> {question.experiment}</div></div></div>}
          <footer><button className="secondary" disabled={current===0} onClick={()=>setCurrent(n=>n-1)}><ArrowLeft size={16}/>Previous</button><button className="primary" disabled={choice===null} onClick={next}>{current===questions.length-1 ? "See results" : "Next question"}<ArrowRight size={16}/></button></footer>
        </article></section>
    </section><Footer/></main>;
}

function Header(){return <header className="site-header"><div className="brand-mark" aria-hidden="true">K</div><div><p className="eyebrow">Machine learning · formative quiz</p><h1>KNN concept check</h1></div><a href="https://alexbernardino.github.io/knn-interactive/" target="_blank" rel="noreferrer">Open interactive demo <ExternalLink size={14}/></a></header>}
function Footer(){return <footer className="site-footer"><span>KNN Concept Check</span><span>Made by Alexandre Bernardino with Codex</span></footer>}
