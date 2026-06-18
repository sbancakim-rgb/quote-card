import { useState, useRef, useEffect } from "react";

const STYLE_PALETTE = {
  dawn_sky: { name: "새벽 하늘", bg: ["#0f0c29","#302b63","#24243e"], textColor: "#f0e6ff", accentColor: "#c9b0ff", overlayColor: "rgba(120,80,200,0.18)", overlayCx:0.3, overlayCy:0.4, overlayR:0.7, mood:"신비롭고 철학적인 명언, 우주와 삶의 의미, 깊은 사유" },
  golden_sunset: { name: "황혼 노을", bg: ["#b34000","#e86830","#f5a623"], textColor: "#fff8ee", accentColor: "#ffe0a0", overlayColor: "rgba(255,240,180,0.2)", overlayCx:0.7, overlayCy:0.25, overlayR:0.6, mood:"희망, 새로운 시작, 도전, 열정적인 명언" },
  forest_dawn: { name: "숲속 새벽", bg: ["#0d3b2e","#1a5c3a","#2d7a50"], textColor: "#e8fff4", accentColor: "#80ffb0", overlayColor: "rgba(40,180,90,0.15)", overlayCx:0.2, overlayCy:0.7, overlayR:0.65, mood:"자연, 성장, 치유, 회복, 평화로운 명언" },
  minimal_white: { name: "미니멀 화이트", bg: ["#f8f8f6","#eeede8"], textColor: "#1a1a1a", accentColor: "#555", overlayColor: null, overlayCx:0, overlayCy:0, overlayR:0, mood:"간결하고 강렬한 명언, 비즈니스, 리더십, 성공" },
  deep_night: { name: "깊은 밤", bg: ["#080810","#12122a","#1a1a3e"], textColor: "#e8d9b0", accentColor: "#ffd060", overlayColor: "rgba(255,200,60,0.07)", overlayCx:0.75, overlayCy:0.2, overlayR:0.55, mood:"고독, 내면의 성찰, 지혜, 철학, 역경을 이겨낸 명언" },
  spring_blossom: { name: "봄 벚꽃", bg: ["#f8dce8","#f5b8cc","#f090a8"], textColor: "#3d1025", accentColor: "#8b1a4a", overlayColor: "rgba(255,255,255,0.3)", overlayCx:0.55, overlayCy:0.35, overlayR:0.55, mood:"사랑, 관계, 따뜻함, 감사, 가족에 관한 명언" },
  ocean_horizon: { name: "바다 수평선", bg: ["#4a6fa5","#6050a0","#18184a"], textColor: "#e0f0ff", accentColor: "#70e8f8", overlayColor: "rgba(100,220,240,0.12)", overlayCx:0.5, overlayCy:0.75, overlayR:0.7, mood:"자유, 꿈, 미래, 가능성, 넓은 시야를 다루는 명언" },
  warm_earth: { name: "대지의 온기", bg: ["#3a1f10","#5a3020","#7a4530"], textColor: "#fff5e0", accentColor: "#ffcc80", overlayColor: "rgba(255,190,80,0.1)", overlayCx:0.4, overlayCy:0.6, overlayR:0.7, mood:"인내, 겸손, 지혜로운 삶, 뿌리, 전통적인 가치관" },
  rose_gold: { name: "로즈 골드", bg: ["#2a1020","#5a2040","#9a4060"], textColor: "#ffe8f0", accentColor: "#ffb8c8", overlayColor: "rgba(255,180,200,0.12)", overlayCx:0.6, overlayCy:0.3, overlayR:0.6, mood:"자존감, 나를 사랑하기, 내면의 아름다움, 여성성" },
  aurora: { name: "오로라", bg: ["#001a10","#003a30","#004a40"], textColor: "#e0fff8", accentColor: "#40ffd0", overlayColor: "rgba(0,220,180,0.15)", overlayCx:0.5, overlayCy:0.5, overlayR:0.8, mood:"경이로움, 불가능을 가능하게, 기적, 창의성" },
};

const QUOTE_THEMES = ["삶의 의미와 가치","도전과 용기","사랑과 관계","성장과 변화","감사와 행복","꿈과 희망","자기 자신을 사랑하기","현재 순간에 집중하기","인내와 끈기","지혜와 배움","자유와 꿈","리더십과 성공"];

async function callClaude(prompt) {
  const res = await fetch("/api/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: prompt }] })
  });
  const data = await res.json();
  const text = data.content.map(i => i.text || "").join("");
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

async function fetchQuoteWithStyle(theme, usedQuotes = []) {
  const styleDesc = Object.entries(STYLE_PALETTE).map(([k,s]) => `- ${k}: ${s.mood}`).join("\n");
  const styleInstruction = `- 명언 분위기에 맞는 스타일 1개 선택`;
  return callClaude(`주제: "${theme}"

다음 중 하나를 선택해서 제시하세요 (매번 다양하게):
- 실제 역사적 위인이나 유명인의 명언 (한국어 번역 포함)
- 한국 또는 세계 각국의 속담
- 오래된 격언이나 잠언

배경 스타일 목록:
${styleDesc}

규칙:
- 실제 존재했던 명언만 사용 (창작 금지)
- 명언이 한국어가 아닌 경우 한국어로 번역
- 원문이 있으면 포함
- 쉼표나 마침표가 나오면 반드시 줄바꿈(\n)을 추가해서 quote_ko에 반영
- 출처 판단 기준:
  · 명언: 해당 인물이 했다는 기록이 명확히 검증된 경우만 실명 기재. 불분명하면 author "미상", author_info "출처 미상"
  · 속담/격언: author는 "한국 속담", "서양 격언", "라틴 격언" 등 출처 문화권으로 표기, author_info는 "오래전부터 전해지는 속담" 등으로 표기
${usedQuotes.length > 0 ? `- 아래 목록은 이미 사용된 것이므로 반드시 제외:\n${usedQuotes.map((q,i) => `  ${i+1}. ${q}`).join("\n")}` : ""}
${styleInstruction}
- JSON만 응답 (코드블록 없이):
{"quote_ko":"한국어 명언 (쉼표/마침표마다 \\n 포함)","quote_original":"원문","author":"인물 이름 또는 미상","author_info":"간단 소개 또는 출처 미상","style_key":"스타일 키","style_reason":"선택 이유 한 줄"}`);
}

async function fetchMessage(quote_ko, author, author_info) {
  return callClaude(`다음 명언을 부서원들에게 공유할 때 함께 보낼 카카오톡 메시지를 작성해주세요.

명언: "${quote_ko}"
인물: ${author} (${author_info})

조건:
- 인삿말 없이 바로 본문으로 시작
- 특정 대상(팀, 직장동료 등)을 지칭하지 않고 누가 읽어도 자연스럽게
- 따뜻하고 격려하는 톤
- 너무 딱딱하거나 설교하는 느낌 NO
- 짧고 자연스럽게 (3~5문장)
- 이모지 1~2개 자연스럽게 포함
- 명언을 직접 인용하지 말고 메시지에 녹여서
- JSON만 응답: {"message":"메시지 내용"}`);
}

function drawQuoteImage(canvas, quote_ko, author, author_info, styleKey) {
  const style = STYLE_PALETTE[styleKey] || STYLE_PALETTE.deep_night;
  const ctx = canvas.getContext("2d");
  const W = 2500, H = 3500;
  canvas.width = W; canvas.height = H;

  const grad = ctx.createLinearGradient(0, 0, W, H);
  style.bg.forEach((c, i) => grad.addColorStop(i / (style.bg.length - 1), c));
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

  if (style.overlayColor) {
    const rad = ctx.createRadialGradient(style.overlayCx*W, style.overlayCy*H, 0, style.overlayCx*W, style.overlayCy*H, style.overlayR*W);
    rad.addColorStop(0, style.overlayColor); rad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rad; ctx.fillRect(0, 0, W, H);
  }

  ctx.globalAlpha = 0.03;
  for (let i = 0; i < 300; i++) {
    ctx.beginPath(); ctx.arc(Math.random()*W, Math.random()*H, Math.random()*3+1, 0, Math.PI*2);
    ctx.fillStyle = style.accentColor; ctx.fill();
  }
  ctx.globalAlpha = 1;

  const lineY1 = H * 0.12;
  ctx.strokeStyle = style.accentColor; ctx.lineWidth = 3; ctx.globalAlpha = 0.4;
  ctx.beginPath(); ctx.moveTo(W*0.12, lineY1); ctx.lineTo(W*0.88, lineY1); ctx.stroke();
  ctx.globalAlpha = 0.6; ctx.fillStyle = style.accentColor;
  ctx.save(); ctx.translate(W/2, lineY1); ctx.rotate(Math.PI/4); ctx.fillRect(-10,-10,20,20); ctx.restore();
  ctx.globalAlpha = 1;

  ctx.font = "bold 500px Georgia, serif"; ctx.fillStyle = style.accentColor;
  ctx.globalAlpha = 0.06; ctx.textAlign = "left"; ctx.fillText("\u201C", W*0.06, H*0.42); ctx.globalAlpha = 1;

  const maxTextW = W * 0.76;
  const baseFontSize = quote_ko.length > 80 ? 88 : quote_ko.length > 50 ? 100 : 112;
  ctx.font = `${baseFontSize}px 'Noto Serif KR', serif`;
  ctx.fillStyle = style.textColor; ctx.textAlign = "center";

  const lines = wrapText(ctx, quote_ko, maxTextW);
  const lineHeight = baseFontSize * 1.75;
  const totalH = lines.length * lineHeight;
  const zoneTop = H*0.20, zoneBot = H*0.72;
  const textStartY = zoneTop + (zoneBot - zoneTop - totalH) / 2;

  ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 30; ctx.shadowOffsetY = 6;
  lines.forEach((line, i) => ctx.fillText(line, W/2, textStartY + i*lineHeight + baseFontSize));
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;

  const dividerY = textStartY + totalH + baseFontSize + 70;
  ctx.strokeStyle = style.accentColor; ctx.lineWidth = 2; ctx.globalAlpha = 0.35;
  ctx.beginPath(); ctx.moveTo(W*0.38, dividerY); ctx.lineTo(W*0.62, dividerY); ctx.stroke(); ctx.globalAlpha = 1;

  ctx.font = `600 72px 'Noto Sans KR', sans-serif`; ctx.fillStyle = style.accentColor; ctx.globalAlpha = 0.95;
  ctx.fillText(`— ${author}`, W/2, dividerY + 100); ctx.globalAlpha = 1;

  ctx.font = `300 50px 'Noto Sans KR', sans-serif`; ctx.fillStyle = style.textColor; ctx.globalAlpha = 0.5;
  ctx.fillText(author_info, W/2, dividerY + 190); ctx.globalAlpha = 1;

  const lineY2 = H * 0.88;
  ctx.strokeStyle = style.accentColor; ctx.lineWidth = 3; ctx.globalAlpha = 0.4;
  ctx.beginPath(); ctx.moveTo(W*0.12, lineY2); ctx.lineTo(W*0.88, lineY2); ctx.stroke();
  ctx.globalAlpha = 0.6; ctx.save(); ctx.translate(W/2, lineY2); ctx.rotate(Math.PI/4); ctx.fillRect(-10,-10,20,20); ctx.restore(); ctx.globalAlpha = 1;

  ctx.font = `300 38px 'Noto Sans KR', sans-serif`; ctx.fillStyle = style.textColor; ctx.globalAlpha = 0.18;
  ctx.fillText("✦  오늘의 명언  ✦", W/2, H*0.94); ctx.globalAlpha = 1;
}

function wrapText(ctx, text, maxWidth) {
  const chars = text.split(""); const lines = []; let current = "";
  for (const ch of chars) {
    if (ch === "\n") { lines.push(current); current = ""; continue; }
    const test = current + ch;
    if (ctx.measureText(test).width > maxWidth && current.length > 0) { lines.push(current); current = ch; }
    else current = test;
  }
  if (current) lines.push(current);
  return lines;
}

export default function App() {
  const [theme, setTheme] = useState("삶의 의미와 가치");
  const [selectedStyle, setSelectedStyle] = useState("auto");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [msgLoading, setMsgLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [activeIdx, setActiveIdx] = useState(null);
  const canvasRef = useRef(null);
  const miniCanvasRefs = useRef([]);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600&family=Noto+Sans+KR:wght@300;400;600&display=swap";
    document.head.appendChild(link);
  }, []);

  // storage에서 history 로드
  useEffect(() => {
    (async () => {
      try {
        const saved = await window.storage.get("quote_history");
        if (saved) {
          const parsed = JSON.parse(saved.value);
          if (Array.isArray(parsed) && parsed.length > 0) setHistory(parsed);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!result || !canvasRef.current) return;
    document.fonts.ready.then(() => drawQuoteImage(canvasRef.current, result.quote_ko, result.author, result.author_info, result.style_key));
  }, [result]);

  useEffect(() => {
    history.forEach((item, i) => {
      const c = miniCanvasRefs.current[i];
      if (c) document.fonts.ready.then(() => drawQuoteImage(c, item.quote_ko, item.author, item.author_info, item.style_key));
    });
    // storage에 저장
    if (history.length > 0) {
      window.storage.set("quote_history", JSON.stringify(history)).catch(() => {});
    }
  }, [history]);

  async function generate(customTheme) {
    setLoading(true); setError(""); setMessage("");
    const t = customTheme || theme;
    try {
      const used = history.map(h => h.quote_ko);
      const data = await fetchQuoteWithStyle(t, used);
      if (selectedStyle !== "auto") data.style_key = selectedStyle;
      setResult(data);
      setActiveIdx(null);
      setMsgLoading(true);
      let savedMessage = "";
      try { const m = await fetchMessage(data.quote_ko, data.author, data.author_info); savedMessage = m.message; setMessage(savedMessage); } catch {}
      setMsgLoading(false);
      setHistory(prev => [{ ...data, theme: t, message: savedMessage }, ...prev.slice(0, 11)]);
    } catch { setError("명언을 불러오지 못했어요. 다시 시도해주세요."); }
    setLoading(false);
  }

  function randomGenerate() {
    const t = QUOTE_THEMES[Math.floor(Math.random() * QUOTE_THEMES.length)];
    setTheme(t); generate(t);
  }

  async function regenerateMessage() {
    if (!result) return;
    setMsgLoading(true); setCopied(false);
    try { const m = await fetchMessage(result.quote_ko, result.author, result.author_info); setMessage(m.message); } catch {}
    setMsgLoading(false);
  }

  function copyMessage() {
    navigator.clipboard.writeText(message).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  async function clearHistory() {
    if (!window.confirm("저장된 명언 기록을 모두 삭제할까요?")) return;
    try { await window.storage.delete("quote_history"); } catch {}
    setHistory([]);
    miniCanvasRefs.current = [];
  }

  function loadHistory(item, idx) {
    setResult(item); setActiveIdx(idx);
    setMessage(item.message || "");
  }

  function download() {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.download = `명언_${result?.author || "quote"}_${Date.now()}.png`;
      a.href = url; document.body.appendChild(a); a.click();
      document.body.removeChild(a); setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  }

  const currentStyle = result ? (STYLE_PALETTE[result.style_key] || STYLE_PALETTE.deep_night) : null;

  return (
    <div style={{ minHeight:"100vh", background:"#080810", fontFamily:"'Noto Sans KR',sans-serif", color:"#f0eaff", display:"flex", flexDirection:"column", alignItems:"center", padding:"36px 16px 72px" }}>

      {/* Header */}
      <div style={{ textAlign:"center", marginBottom:40 }}>
        <div style={{ fontSize:11, letterSpacing:8, color:"#8860cc", marginBottom:12, textTransform:"uppercase" }}>✦  Words That Move  ✦</div>
        <h1 style={{ fontSize:28, fontWeight:700, margin:0, letterSpacing:-0.5 }}>오늘의 명언 카드</h1>
        <p style={{ fontSize:13, color:"#6655aa", margin:"8px 0 0" }}>위인의 실제 명언 · AI가 어울리는 배경 선택 · 2500×3500 고화질</p>
      </div>

      {/* Controls */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:12, justifyContent:"center", maxWidth:560, width:"100%" }}>
        <select value={theme} onChange={e => setTheme(e.target.value)} style={{ background:"#16142a", border:"1px solid #2e2860", color:"#c8b8ff", borderRadius:10, padding:"11px 14px", fontSize:14, flex:1, minWidth:180, cursor:"pointer", outline:"none" }}>
          {QUOTE_THEMES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={selectedStyle} onChange={e => setSelectedStyle(e.target.value)} style={{ background:"#16142a", border:"1px solid #2e2860", color:"#c8b8ff", borderRadius:10, padding:"11px 14px", fontSize:14, flex:1, minWidth:160, cursor:"pointer", outline:"none" }}>
          <option value="auto">✨ AI가 자동 선택</option>
          {Object.entries(STYLE_PALETTE).map(([k,s]) => <option key={k} value={k}>{s.name}</option>)}
        </select>
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:28, justifyContent:"center" }}>
        <button onClick={() => generate()} disabled={loading} style={{ background: loading?"#2a2050":"linear-gradient(135deg,#6040b0,#9060f0)", color:"#fff", border:"none", borderRadius:10, padding:"11px 24px", fontSize:14, fontWeight:700, cursor: loading?"not-allowed":"pointer", whiteSpace:"nowrap" }}>
          {loading ? "✨ 생성 중..." : "이 주제로 생성"}
        </button>
        <button onClick={randomGenerate} disabled={loading} style={{ background:"#16142a", color:"#9060f0", border:"1px solid #2e2860", borderRadius:10, padding:"11px 18px", fontSize:14, fontWeight:600, cursor: loading?"not-allowed":"pointer", whiteSpace:"nowrap" }}>
          🎲 랜덤
        </button>
      </div>

      {error && <div style={{ color:"#ff7070", fontSize:13, marginBottom:16 }}>{error}</div>}

      {result ? (
        <>
          {/* Style badge */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, background:"#16142a", borderRadius:20, padding:"7px 16px", border:"1px solid #2e2860" }}>
            <div style={{ width:12, height:12, borderRadius:"50%", background: currentStyle?.accentColor || "#9060f0" }} />
            <span style={{ fontSize:12, color:"#9988cc" }}>{currentStyle?.name} 스타일</span>
            <span style={{ fontSize:11, color:"#554488" }}>— {result.style_reason}</span>
          </div>

          {/* Canvas */}
          <div style={{ width:"min(400px,88vw)", aspectRatio:"5/7", borderRadius:18, overflow:"hidden", boxShadow:"0 40px 100px rgba(0,0,0,0.7)", marginBottom:20, position:"relative", background:"#111" }}>
            <canvas ref={canvasRef} style={{ width:"100%", height:"100%", display:"block" }} />
            {loading && (
              <div style={{ position:"absolute", inset:0, background:"rgba(5,4,14,0.75)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:"#bbb" }}>✨ 생성 중...</div>
            )}
          </div>

          {/* Quote meta */}
          <div style={{ maxWidth:400, width:"100%", marginBottom:22, background:"#16142a", borderRadius:14, padding:"16px 20px", border:"1px solid #2e2860" }}>
            <div style={{ fontSize:13, color:"#c8b8ff", lineHeight:1.7, marginBottom:10 }}>"{result.quote_ko}"</div>
            {result.quote_original !== result.quote_ko && (
              <div style={{ fontSize:11, color:"#665588", lineHeight:1.6, marginBottom:8, fontStyle:"italic" }}>{result.quote_original}</div>
            )}
            <div style={{ fontSize:12, color:"#9060f0", fontWeight:600 }}>{result.author}</div>
            <div style={{ fontSize:11, color:"#554488", marginTop:2 }}>{result.author_info}</div>
          </div>

          {/* Download */}
          <button onClick={download} style={{ background:"linear-gradient(135deg,#6040b0,#9060f0)", color:"#fff", border:"none", borderRadius:12, padding:"14px 44px", fontSize:15, fontWeight:700, cursor:"pointer", marginBottom:28, boxShadow:"0 10px 36px rgba(144,96,240,0.45)" }}>
            ↓ 고화질 다운로드 (2500×3500)
          </button>

          {/* Message Card */}
          <div style={{ maxWidth:400, width:"100%", marginBottom:44, background:"#16142a", borderRadius:16, padding:"20px", border:"1px solid #2e2860" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontSize:12, color:"#8860cc", letterSpacing:2, fontWeight:600 }}>💬 함께 보낼 메시지</div>
              <button onClick={regenerateMessage} disabled={msgLoading} style={{ background:"none", border:"1px solid #2e2860", color:"#7755bb", borderRadius:8, padding:"4px 10px", fontSize:11, cursor: msgLoading?"not-allowed":"pointer" }}>
                {msgLoading ? "생성 중..." : "↺ 다시 생성"}
              </button>
            </div>
            {msgLoading ? (
              <div style={{ color:"#554488", fontSize:13, padding:"12px 0", textAlign:"center" }}>✨ 메시지 작성 중...</div>
            ) : message ? (
              <>
                <div style={{ fontSize:14, color:"#d8ccff", lineHeight:1.85, whiteSpace:"pre-wrap", marginBottom:16, padding:"14px", background:"#100e20", borderRadius:10, border:"1px solid #221c44" }}>
                  {message}
                </div>
                <button onClick={copyMessage} style={{ width:"100%", background: copied?"linear-gradient(135deg,#206040,#30a060)":"linear-gradient(135deg,#3a2080,#6040c0)", color:"#fff", border:"none", borderRadius:10, padding:"11px", fontSize:14, fontWeight:700, cursor:"pointer", transition:"all 0.2s" }}>
                  {copied ? "✓ 복사됨!" : "복사하기"}
                </button>
              </>
            ) : null}
          </div>
        </>
      ) : (
        <div style={{ width:"min(400px,88vw)", aspectRatio:"5/7", borderRadius:18, border:"2px dashed #1e1a40", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#332a66", marginBottom:40, gap:12 }}>
          <div style={{ fontSize:44, opacity:0.5 }}>✦</div>
          <div style={{ fontSize:14, opacity:0.7 }}>주제를 고르고 생성해보세요</div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div style={{ width:"100%", maxWidth:520 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontSize:10, color:"#443366", letterSpacing:4 }}>RECENT</div>
            <button onClick={clearHistory} style={{ background:"none", border:"1px solid #2a1a3a", color:"#553366", borderRadius:6, padding:"3px 10px", fontSize:11, cursor:"pointer" }}>기록 초기화</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {history.map((item, i) => (
              <div key={i} onClick={() => loadHistory(item, i)} style={{ aspectRatio:"5/7", borderRadius:10, overflow:"hidden", cursor:"pointer", border: activeIdx===i?"2px solid #9060f0":"2px solid transparent", boxShadow: activeIdx===i?"0 0 16px rgba(144,96,240,0.5)":"none", transition:"all 0.2s", background:"#111" }}>
                <canvas ref={el => miniCanvasRefs.current[i] = el} style={{ width:"100%", height:"100%", display:"block" }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
