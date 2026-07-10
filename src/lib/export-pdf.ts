import { MOOD_OPTIONS } from "@/lib/companions";

// Helper to format date in Indonesian
function formatDateIndo(dateStr: string | Date): string {
  return new Date(dateStr).toLocaleString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function getTimestampIndo(): string {
  return new Date().toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function markdownToHtml(text: string): string {
  if (!text) return "";
  
  const lines = text.split("\n");
  
  const parsedLines = lines.map((line) => {
    const trimmed = line.trim();
    
    if (trimmed === "---" || trimmed === "***") {
      return '<hr style="margin: 12px 0; border: 0; border-top: 1px dashed #e5e2dc;" />';
    }

    let isH4 = false;
    let isH3 = false;
    let isH2 = false;
    let isBullet = false;
    let content = line;

    if (line.startsWith("### ")) {
      isH4 = true;
      content = line.slice(4);
    } else if (line.startsWith("## ")) {
      isH3 = true;
      content = line.slice(3);
    } else if (line.startsWith("# ")) {
      isH2 = true;
      content = line.slice(2);
    } else if (line.startsWith("* ") || line.startsWith("- ")) {
      isBullet = true;
      content = line.slice(2);
    }

    // Replace bold (**) and italics (*)
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: bold; color: #18181b;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>');

    if (isH4) {
      return `<h4 style="font-size: 13px; font-weight: bold; color: #581c87; margin-top: 12px; margin-bottom: 4px; font-family: system-ui, -apple-system, sans-serif;">${formatted}</h4>`;
    }
    if (isH3) {
      return `<h3 style="font-size: 14px; font-weight: bold; color: #581c87; margin-top: 16px; margin-bottom: 8px; font-family: system-ui, -apple-system, sans-serif;">${formatted}</h3>`;
    }
    if (isH2) {
      return `<h2 style="font-size: 16px; font-weight: bold; color: #581c87; margin-top: 20px; margin-bottom: 8px; font-family: system-ui, -apple-system, sans-serif;">${formatted}</h2>`;
    }
    if (isBullet) {
      return `<div style="display: flex; align-items: flex-start; gap: 8px; margin-left: 8px; margin-bottom: 4px; font-family: system-ui, -apple-system, sans-serif;">
        <span style="color: #a855f7; user-select: none;">•</span>
        <span style="flex: 1;">${formatted}</span>
      </div>`;
    }

    if (trimmed === "") {
      return '<div style="height: 8px;"></div>';
    }
    return `<p style="margin: 0 0 8px 0; font-family: system-ui, -apple-system, sans-serif;">${formatted}</p>`;
  });

  return parsedLines.join("");
}

function triggerPrint(htmlContent: string) {
  // Create an iframe to prevent changing current page layouts
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    alert("Gagal membuka window pencetakan.");
    return;
  }

  doc.open();
  doc.write(htmlContent);
  doc.close();

  // Wait a short time for browser rendering and trigger print dialog
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    // Remove iframe after print dialog is closed
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 500);
}

export function exportMoodPDF(checkIn: any) {
  const formattedDate = formatDateIndo(checkIn.created_at || checkIn.date);
  const printTimestamp = getTimestampIndo();
  
  const moodOpt = MOOD_OPTIONS.find((x: any) => x.key === checkIn.mood);
  const emoji = moodOpt?.emoji ?? "🌿";
  const moodLabel = moodOpt?.label ?? checkIn.mood;

  const triggersHtml = checkIn.triggers && checkIn.triggers.length > 0
    ? checkIn.triggers.map((t: string) => `<span class="trigger-pill">${t}</span>`).join("")
    : "<em>Tidak ada faktor pemicu yang dicatat.</em>";

  const html = `
    <html>
    <head>
      <title>JN-CALM - Catatan Mood</title>
      <style>
        body {
          font-family: 'system-ui', -apple-system, sans-serif;
          color: #3f3f46;
          background-color: #faf8f5;
          padding: 30px;
          margin: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .card {
          background: white;
          border: 1px solid #e5e2dc;
          border-radius: 24px;
          padding: 35px;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: 0 4px 20px rgba(0,0,0,0.01);
        }
        .header {
          text-align: center;
          border-bottom: 2px dashed #e5e2dc;
          padding-bottom: 20px;
          margin-bottom: 25px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #7b8e72;
          margin-bottom: 4px;
        }
        .subtitle {
          font-size: 11px;
          color: #888888;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .title {
          font-size: 18px;
          font-weight: bold;
          margin-top: 15px;
          margin-bottom: 5px;
          color: #27272a;
        }
        .date {
          font-size: 12px;
          color: #71717a;
        }
        .mood-badge {
          display: inline-block;
          font-size: 44px;
          margin: 15px 0 5px 0;
          line-height: 1;
        }
        .mood-label {
          font-size: 16px;
          font-weight: bold;
          text-transform: capitalize;
          color: #4a5c43;
          margin-bottom: 25px;
        }
        .metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 25px;
        }
        .metric-box {
          background: #fcfbfa;
          border: 1px solid #f0ede6;
          border-radius: 16px;
          padding: 12px;
          text-align: center;
        }
        .metric-label {
          font-size: 10px;
          font-weight: bold;
          color: #71717a;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .metric-value {
          font-size: 16px;
          font-weight: bold;
          color: #18181b;
        }
        .section-title {
          font-size: 11px;
          font-weight: bold;
          color: #a1a1aa;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
          border-left: 3px solid #7b8e72;
          padding-left: 8px;
          text-align: left;
        }
        .content-box {
          background: #faf8f5;
          border-radius: 16px;
          padding: 15px 20px;
          font-size: 13px;
          line-height: 1.6;
          color: #27272a;
          text-align: left;
          margin-bottom: 20px;
          border-left: 1px solid #e5e2dc;
        }
        .triggers-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }
        .trigger-pill {
          background: #f4f7f4;
          border: 1px solid #e2ebd9;
          color: #4a5c43;
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
        }
        .footer {
          text-align: center;
          font-size: 10px;
          color: #a1a1aa;
          margin-top: 25px;
          border-top: 1px solid #f0ede6;
          padding-top: 12px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">🌿 JN-CALM</div>
          <div class="subtitle">Your Safe Space</div>
          <div class="title">Catatan Suasana Hati (Mood Check-in)</div>
          <div class="date">${formattedDate}</div>
        </div>
        
        <div style="text-align: center;">
          <div class="mood-badge">${emoji}</div>
          <div class="mood-label">${moodLabel}</div>
        </div>

        <div class="metrics">
          <div class="metric-box">
            <div class="metric-label">Mood</div>
            <div class="metric-value">${checkIn.mood_score}/10</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Stres</div>
            <div class="metric-value">${checkIn.stress_score}/10</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Energi</div>
            <div class="metric-value">${checkIn.energy_score}/10</div>
          </div>
        </div>

        <div class="section-title">Faktor Mempengaruhi</div>
        <div class="triggers-container">
          ${triggersHtml}
        </div>

        <div class="section-title">Catatan Refleksi</div>
        <div class="content-box">
          ${checkIn.note ? `"${checkIn.note}"` : "<em>Tidak ada catatan tertulis untuk hari ini.</em>"}
        </div>

        <div class="footer">
          Dicetak secara aman dari JN-CALM pada ${printTimestamp}. Langkah kecilmu sangat berarti. 🤍
        </div>
      </div>
    </body>
    </html>
  `;
  triggerPrint(html);
}

export function exportGratitudePDF(entry: any) {
  const formattedDate = formatDateIndo(entry.created_at || entry.date);
  const printTimestamp = getTimestampIndo();

  const html = `
    <html>
    <head>
      <title>JN-CALM - Lembar Syukur Harian</title>
      <style>
        body {
          font-family: 'system-ui', -apple-system, sans-serif;
          color: #3f3f46;
          background-color: #faf8f5;
          padding: 30px;
          margin: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .card {
          background: white;
          border: 1px solid #e5e2dc;
          border-radius: 24px;
          padding: 35px;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: 0 4px 20px rgba(0,0,0,0.01);
        }
        .header {
          text-align: center;
          border-bottom: 2px dashed #e5e2dc;
          padding-bottom: 20px;
          margin-bottom: 25px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #7b8e72;
          margin-bottom: 4px;
        }
        .subtitle {
          font-size: 11px;
          color: #888888;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .title {
          font-size: 18px;
          font-weight: bold;
          margin-top: 15px;
          margin-bottom: 5px;
          color: #27272a;
        }
        .date {
          font-size: 12px;
          color: #71717a;
        }
        .section-title {
          font-size: 11px;
          font-weight: bold;
          color: #a1a1aa;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 20px;
          margin-bottom: 10px;
          border-left: 3px solid #7b8e72;
          padding-left: 8px;
          text-align: left;
        }
        .gratitude-list {
          margin: 0;
          padding: 0;
          list-style: none;
          margin-bottom: 20px;
        }
        .gratitude-item {
          background: #faf8f5;
          border-left: 4px solid #c9b097;
          border-radius: 0 16px 16px 0;
          padding: 12px 18px;
          margin-bottom: 10px;
          font-size: 13px;
          line-height: 1.6;
          color: #27272a;
          text-align: left;
        }
        .gratitude-item span {
          font-weight: bold;
          color: #8b6e51;
          margin-right: 6px;
        }
        .momen-box {
          background: #fdf9f2;
          border: 1px solid #f6eedb;
          border-radius: 16px;
          padding: 15px 20px;
          font-size: 13px;
          line-height: 1.6;
          color: #5c4a37;
          text-align: left;
          margin-bottom: 20px;
        }
        .lesson-box {
          background: #f2f7fd;
          border: 1px solid #e1eefa;
          border-radius: 16px;
          padding: 15px 20px;
          font-size: 13px;
          line-height: 1.6;
          color: #3b4e63;
          text-align: left;
          margin-bottom: 20px;
        }
        .footer {
          text-align: center;
          font-size: 10px;
          color: #a1a1aa;
          margin-top: 25px;
          border-top: 1px solid #f0ede6;
          padding-top: 12px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">🌿 JN-CALM</div>
          <div class="subtitle">Your Safe Space</div>
          <div class="title">Lembar Syukur Harian (Gratitude Journal)</div>
          <div class="date">${formattedDate}</div>
        </div>

        <div class="section-title">3 Hal yang Disyukuri Hari Ini</div>
        <ul class="gratitude-list">
          <li class="gratitude-item"><span>1.</span> ${entry.gratitude1 || "—"}</li>
          <li class="gratitude-item"><span>2.</span> ${entry.gratitude2 || "—"}</li>
          <li class="gratitude-item"><span>3.</span> ${entry.gratitude3 || "—"}</li>
        </ul>

        <div class="section-title">⭐ Momen Terbaik Hari Ini</div>
        <div class="momen-box">
          ${entry.best_moment || "<em>Tidak ada momen terbaik yang dicatat.</em>"}
        </div>

        <div class="section-title">📘 Pelajaran Berharga</div>
        <div class="lesson-box">
          ${entry.lesson || "<em>Tidak ada pelajaran yang dicatat.</em>"}
        </div>

        <div class="footer">
          Dicetak secara aman dari JN-CALM pada ${printTimestamp}. Bersyukur membawa kedamaian hati. 🙏
        </div>
      </div>
    </body>
    </html>
  `;
  triggerPrint(html);
}

export function exportJournalPDF(journal: any) {
  const formattedDate = formatDateIndo(journal.created_at || journal.date);
  const printTimestamp = getTimestampIndo();

  const html = `
    <html>
    <head>
      <title>JN-CALM - Lembar Diary</title>
      <style>
        body {
          font-family: 'system-ui', -apple-system, sans-serif;
          color: #3f3f46;
          background-color: #faf8f5;
          padding: 30px;
          margin: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .card {
          background: white;
          border: 1px solid #e5e2dc;
          border-radius: 24px;
          padding: 35px;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: 0 4px 20px rgba(0,0,0,0.01);
        }
        .header {
          text-align: center;
          border-bottom: 2px dashed #e5e2dc;
          padding-bottom: 20px;
          margin-bottom: 25px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #7b8e72;
          margin-bottom: 4px;
        }
        .subtitle {
          font-size: 11px;
          color: #888888;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .title {
          font-size: 18px;
          font-weight: bold;
          margin-top: 15px;
          margin-bottom: 5px;
          color: #27272a;
        }
        .date {
          font-size: 12px;
          color: #71717a;
        }
        .tag-container {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .tag {
          background: #faf8f5;
          border: 1px solid #e5e2dc;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          color: #52525b;
          font-weight: 500;
        }
        .paper-lines {
          background: #fdfcf9;
          border: 1px solid #ebd9c5;
          border-radius: 16px;
          padding: 25px;
          font-size: 13px;
          line-height: 2;
          color: #3f3933;
          text-align: left;
          background-image: linear-gradient(#f0ede6 1px, transparent 1px);
          background-size: 100% 2em;
          margin-bottom: 20px;
          min-height: 120px;
        }
        .section-title {
          font-size: 11px;
          font-weight: bold;
          color: #a1a1aa;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 20px;
          margin-bottom: 10px;
          border-left: 3px solid #7b8e72;
          padding-left: 8px;
          text-align: left;
        }
        .meta-box {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-bottom: 20px;
        }
        .meta-item {
          background: #faf8f5;
          border-radius: 12px;
          padding: 10px 15px;
          font-size: 12px;
          line-height: 1.5;
        }
        .meta-label {
          font-weight: bold;
          color: #71717a;
          margin-bottom: 2px;
          font-size: 10px;
          text-transform: uppercase;
        }
        .footer {
          text-align: center;
          font-size: 10px;
          color: #a1a1aa;
          margin-top: 25px;
          border-top: 1px solid #f0ede6;
          padding-top: 12px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">🌿 JN-CALM</div>
          <div class="subtitle">Your Safe Space</div>
          <div class="title">Lembar Catatan Diary</div>
          <div class="date">${formattedDate}</div>
        </div>

        <div class="tag-container">
          ${journal.main_emotion ? `<div class="tag">😊 Emosi: ${journal.main_emotion}</div>` : ""}
          ${journal.main_trigger ? `<div class="tag">🎯 Pemicu: ${journal.main_trigger}</div>` : ""}
          ${journal.source === "from_chat" ? '<div class="tag">🤖 Sumber: Chat AI</div>' : '<div class="tag">✍️ Sumber: Diary Mandiri</div>'}
        </div>

        <div class="paper-lines">
          ${journal.summary || "<em>Tidak ada isi catatan tertulis.</em>"}
        </div>

        <div class="section-title">Refleksi Hari Ini</div>
        <div class="meta-box">
          ${journal.gratitude ? `
            <div class="meta-item">
              <div class="meta-label">Hal yang Disyukuri</div>
              <div>${journal.gratitude}</div>
            </div>
          ` : ""}
          ${journal.lesson ? `
            <div class="meta-item">
              <div class="meta-label">Pelajaran Berharga</div>
              <div>${journal.lesson}</div>
            </div>
          ` : ""}
          ${journal.tomorrow_focus ? `
            <div class="meta-item">
              <div class="meta-label">Fokus Esok Hari</div>
              <div>${journal.tomorrow_focus}</div>
            </div>
          ` : ""}
        </div>

        <div class="footer">
          Dicetak secara aman dari JN-CALM pada ${printTimestamp}. Lembar diary adalah saksi bisu perjalanan bertumbuhmu. 📓
        </div>
      </div>
    </body>
    </html>
  `;
  triggerPrint(html);
}

export function exportWeeklyInsightPDF(dateStr: string, text: string, title = "Analisis Mingguan AI (Weekly Insight)") {
  const formattedDate = formatDateIndo(dateStr);
  const printTimestamp = getTimestampIndo();

  const html = `
    <html>
    <head>
      <title>JN-CALM - AI Insight</title>
      <style>
        body {
          font-family: 'system-ui', -apple-system, sans-serif;
          color: #3f3f46;
          background-color: #faf8f5;
          padding: 30px;
          margin: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .card {
          background: white;
          border: 1px solid #e5e2dc;
          border-radius: 24px;
          padding: 35px;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: 0 4px 20px rgba(0,0,0,0.01);
        }
        .header {
          text-align: center;
          border-bottom: 2px dashed #e5e2dc;
          padding-bottom: 20px;
          margin-bottom: 25px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #7b8e72;
          margin-bottom: 4px;
        }
        .subtitle {
          font-size: 11px;
          color: #888888;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .title {
          font-size: 18px;
          font-weight: bold;
          margin-top: 15px;
          margin-bottom: 5px;
          color: #27272a;
        }
        .date {
          font-size: 12px;
          color: #71717a;
        }
        .content-box {
          background: #faf8f5;
          border-radius: 16px;
          padding: 20px 25px;
          font-size: 13px;
          line-height: 1.8;
          color: #27272a;
          text-align: left;
          margin-bottom: 25px;
          border-left: 3px solid #7b8e72;
        }
        .footer {
          text-align: center;
          font-size: 10px;
          color: #a1a1aa;
          margin-top: 25px;
          border-top: 1px solid #f0ede6;
          padding-top: 12px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">🌿 JN-CALM</div>
          <div class="subtitle">Your Safe Space</div>
          <div class="title">${title}</div>
          <div class="date">${formattedDate}</div>
        </div>

        <div class="content-box">
          ${markdownToHtml(text)}
        </div>

        <div class="footer">
          Dicetak secara aman dari JN-CALM pada ${printTimestamp}. Setiap langkah kecil menuju kesehatan jiwamu sangat berarti. 🤍
        </div>
      </div>
    </body>
    </html>
  `;
  triggerPrint(html);
}

export function exportChatPDF(companionName: string, companionEmoji: string, messages: any[]) {
  const printTimestamp = getTimestampIndo();
  
  // Filter out system messages
  const chatMessages = messages.filter(m => m.role !== "system");

  const chatHtml = chatMessages.map((m) => {
    const isUser = m.role === "user";
    const sender = isUser ? "Saya" : companionName;
    return `
      <div class="message-row ${isUser ? "user" : "assistant"}">
        <div style="width: 100%;">
          <span class="sender-label">${sender}</span>
          <div class="bubble">
            ${m.content}
          </div>
        </div>
      </div>
    `;
  }).join("");

  const html = `
    <html>
    <head>
      <title>JN-CALM - Chat dengan ${companionName}</title>
      <style>
        body {
          font-family: 'system-ui', -apple-system, sans-serif;
          color: #3f3f46;
          background-color: #faf8f5;
          padding: 30px;
          margin: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .card {
          background: white;
          border: 1px solid #e5e2dc;
          border-radius: 24px;
          padding: 35px;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: 0 4px 20px rgba(0,0,0,0.01);
        }
        .header {
          text-align: center;
          border-bottom: 2px dashed #e5e2dc;
          padding-bottom: 20px;
          margin-bottom: 25px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #7b8e72;
          margin-bottom: 4px;
        }
        .subtitle {
          font-size: 11px;
          color: #888888;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .title {
          font-size: 18px;
          font-weight: bold;
          margin-top: 15px;
          margin-bottom: 5px;
          color: #27272a;
        }
        .companion-info {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #4a5c43;
          font-weight: bold;
          margin-top: 5px;
        }
        .chat-container {
          margin-top: 25px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .message-row {
          display: flex;
          width: 100%;
        }
        .message-row.user {
          justify-content: flex-end;
        }
        .message-row.assistant {
          justify-content: flex-start;
        }
        .bubble {
          max-width: 85%;
          border-radius: 18px;
          padding: 12px 16px;
          font-size: 13px;
          line-height: 1.5;
          text-align: left;
          word-wrap: break-word;
        }
        .message-row.user .bubble {
          background-color: #27272a;
          color: #faf8f5;
          border-bottom-right-radius: 4px;
          margin-left: auto;
        }
        .message-row.assistant .bubble {
          background-color: #f4f4f5;
          color: #18181b;
          border: 1px solid #e4e4e7;
          border-bottom-left-radius: 4px;
        }
        .sender-label {
          font-size: 9px;
          font-weight: bold;
          color: #a1a1aa;
          text-transform: uppercase;
          margin-bottom: 4px;
          display: block;
        }
        .message-row.user .sender-label {
          text-align: right;
        }
        .footer {
          text-align: center;
          font-size: 10px;
          color: #a1a1aa;
          margin-top: 30px;
          border-top: 1px solid #f0ede6;
          padding-top: 12px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">🌿 JN-CALM</div>
          <div class="subtitle">Your Safe Space</div>
          <div class="title">Transkrip Percakapan Pendamping AI</div>
          <div class="companion-info">${companionEmoji} ${companionName}</div>
        </div>

        <div class="chat-container">
          ${chatHtml}
        </div>

        <div class="footer">
          Dicetak secara aman dari JN-CALM pada ${printTimestamp}. Percakapan dengan pendamping adalah ruang amanmu bercerita. 🤍
        </div>
      </div>
    </body>
    </html>
  `;
  triggerPrint(html);
}

export function exportMoodsReportPDF(moods: any[]) {
  const printTimestamp = getTimestampIndo();
  
  const moodsHtml = moods.map((m) => {
    const formattedDate = formatDateIndo(m.created_at || m.date);
    const moodOpt = MOOD_OPTIONS.find((x: any) => x.key === m.mood);
    const emoji = moodOpt?.emoji ?? "🌿";
    const moodLabel = moodOpt?.label ?? m.mood;
    const noteText = m.note ? `"${m.note}"` : "—";
    const triggersText = m.triggers && m.triggers.length > 0 ? m.triggers.join(", ") : "—";
    
    return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #f0ede6; font-size: 11px;">${formattedDate}</td>
        <td style="padding: 10px; border-bottom: 1px solid #f0ede6; font-size: 13px; font-weight: bold; text-align: center;">${emoji} ${moodLabel}</td>
        <td style="padding: 10px; border-bottom: 1px solid #f0ede6; font-size: 12px; text-align: center;">M: ${m.mood_score}/10<br>S: ${m.stress_score}/10<br>E: ${m.energy_score}/10</td>
        <td style="padding: 10px; border-bottom: 1px solid #f0ede6; font-size: 11px;">${triggersText}</td>
        <td style="padding: 10px; border-bottom: 1px solid #f0ede6; font-size: 11px; font-style: italic;">${noteText}</td>
      </tr>
    `;
  }).join("");

  const html = `
    <html>
    <head>
      <title>JN-CALM - Laporan Riwayat Mood</title>
      <style>
        body {
          font-family: 'system-ui', -apple-system, sans-serif;
          color: #3f3f46;
          background-color: #faf8f5;
          padding: 20px;
          margin: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .container {
          background: white;
          border: 1px solid #e5e2dc;
          border-radius: 24px;
          padding: 30px;
          margin: 0 auto;
          box-shadow: 0 4px 20px rgba(0,0,0,0.01);
        }
        .header {
          text-align: center;
          border-bottom: 2px dashed #e5e2dc;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .logo {
          font-size: 20px;
          font-weight: bold;
          color: #7b8e72;
        }
        .title {
          font-size: 16px;
          font-weight: bold;
          margin-top: 10px;
          color: #27272a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        th {
          background: #f4f2ed;
          color: #4a5c43;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          padding: 10px;
          border-bottom: 2px solid #e5e2dc;
        }
        .footer {
          text-align: center;
          font-size: 9px;
          color: #a1a1aa;
          margin-top: 25px;
          border-top: 1px solid #f0ede6;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🌿 JN-CALM</div>
          <div class="title">Laporan Riwayat Mood (Mood Check-ins)</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 20%; text-align: left;">Tanggal</th>
              <th style="width: 15%; text-align: center;">Mood</th>
              <th style="width: 15%; text-align: center;">Skor</th>
              <th style="width: 20%; text-align: left;">Pemicu</th>
              <th style="width: 30%; text-align: left;">Catatan</th>
            </tr>
          </thead>
          <tbody>
            ${moodsHtml}
          </tbody>
        </table>
        <div class="footer">
          Laporan diunduh secara aman dari JN-CALM pada ${printTimestamp}. Setiap catatan adalah langkah kecilmu yang berharga. 🤍
        </div>
      </div>
    </body>
    </html>
  `;
  triggerPrint(html);
}

export function exportGratitudesReportPDF(entries: any[]) {
  const printTimestamp = getTimestampIndo();
  
  const entriesHtml = entries.map((e) => {
    const formattedDate = formatDateIndo(e.created_at || e.date);
    const gratitudes = [e.gratitude1, e.gratitude2, e.gratitude3].filter(Boolean).map((g, i) => `${i+1}. ${g}`).join("<br>");
    const bestMoment = e.best_moment ? `⭐ ${e.best_moment}` : "—";
    const lessonText = e.lesson ? `💡 ${e.lesson}` : "—";
    
    return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #f0ede6; font-size: 11px; vertical-align: top;">${formattedDate}</td>
        <td style="padding: 10px; border-bottom: 1px solid #f0ede6; font-size: 12px; vertical-align: top; line-height: 1.5;">${gratitudes}</td>
        <td style="padding: 10px; border-bottom: 1px solid #f0ede6; font-size: 12px; vertical-align: top;">${bestMoment}</td>
        <td style="padding: 10px; border-bottom: 1px solid #f0ede6; font-size: 12px; vertical-align: top;">${lessonText}</td>
      </tr>
    `;
  }).join("");

  const html = `
    <html>
    <head>
      <title>JN-CALM - Laporan Jurnal Syukur</title>
      <style>
        body {
          font-family: 'system-ui', -apple-system, sans-serif;
          color: #3f3f46;
          background-color: #faf8f5;
          padding: 20px;
          margin: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .container {
          background: white;
          border: 1px solid #e5e2dc;
          border-radius: 24px;
          padding: 30px;
          margin: 0 auto;
          box-shadow: 0 4px 20px rgba(0,0,0,0.01);
        }
        .header {
          text-align: center;
          border-bottom: 2px dashed #e5e2dc;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .logo {
          font-size: 20px;
          font-weight: bold;
          color: #7b8e72;
        }
        .title {
          font-size: 16px;
          font-weight: bold;
          margin-top: 10px;
          color: #27272a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        th {
          background: #fdf9f2;
          color: #8b6e51;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          padding: 10px;
          border-bottom: 2px solid #e5e2dc;
        }
        .footer {
          text-align: center;
          font-size: 9px;
          color: #a1a1aa;
          margin-top: 25px;
          border-top: 1px solid #f0ede6;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🌿 JN-CALM</div>
          <div class="title">Laporan Riwayat Jurnal Syukur (Gratitude Journal)</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 20%; text-align: left;">Tanggal</th>
              <th style="width: 35%; text-align: left;">Hal yang Disyukuri</th>
              <th style="width: 22%; text-align: left;">Momen Terbaik</th>
              <th style="width: 23%; text-align: left;">Pelajaran</th>
            </tr>
          </thead>
          <tbody>
            ${entriesHtml}
          </tbody>
        </table>
        <div class="footer">
          Laporan diunduh secara aman dari JN-CALM pada ${printTimestamp}. Bersyukur membawa damai di hati. 🙏
        </div>
      </div>
    </body>
    </html>
  `;
  triggerPrint(html);
}

export function exportAnalyticsReportPDF(data: any) {
  const printTimestamp = getTimestampIndo();
  
  const toolsInfo = {
    breath: { name: "Breathing 4-7-8", emoji: "🌬️" },
    ground: { name: "Grounding 5-4-3-2-1", emoji: "🌍" },
    selftalk: { name: "Self-Calming Talk", emoji: "🤍" },
    vent: { name: "Kotak Pelepasan", emoji: "🍃" },
    reframing: { name: "Ubah Sudut Pandang", emoji: "🪞" },
    somatic: { name: "Latihan Somatik", emoji: "🦋" },
    panic: { name: "Panic Attack Timer", emoji: "🆘" },
  };

  const efficacyRowsHtml = Object.entries(toolsInfo).map(([key, info]) => {
    const stats = data?.feedbackStats?.efficacy?.[key] ?? { total: 0, helpful: 0, pct: 0 };
    return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #f0ede6; font-size: 11px;">${info.emoji} ${info.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #f0ede6; font-size: 11px; text-align: center;">${stats.pct}%</td>
        <td style="padding: 8px; border-bottom: 1px solid #f0ede6; font-size: 11px; text-align: center;">${stats.helpful} / ${stats.total} sesi</td>
      </tr>
    `;
  }).join("");

  const MOOD_RESOLUTIONS_INFO: any = {
    stress: { emoji: "😰", name: "Stres (Stress)", neuro: "Aktivasi Aksis HPA -> Sekresi Kortisol & Adrenalin -> Menurunkan kontrol kognitif PFC.", transmitter: "Peningkatan Asetilkolin (Vagus) & Supresi Kortisol" },
    cemas: { emoji: "😨", name: "Cemas (Anxiety)", neuro: "Hiperaktivitas Amigdala -> Hambatan GABAergik -> Sinyal ancaman persisten ke PFC.", transmitter: "Peningkatan Transmisi GABA & Supresi Amigdala" },
    sedih: { emoji: "😢", name: "Sedih (Sadness)", neuro: "Hipofungsi Serotonergik Raphe Nucleus -> Hiperaktivitas Default Mode Network (DMN).", transmitter: "Stimulasi Serotonin & Reduksi Aktivitas DMN" },
    lelah: { emoji: "🥱", name: "Lelah (Fatigue)", neuro: "Akumulasi Adenosin basal otak -> Deplesi cadangan glikogen astrosit.", transmitter: "Klirens Adenosin & Restorasi Glikogen Astrosit" },
    burnout: { emoji: "🔥", name: "Burnout", neuro: "Downregulation reseptor Dopamin D2 di jalur mesolimbik akibat kortisol jangka panjang.", transmitter: "Resensitisasi Dopamin D2 & Regulasi Kortisol" },
    kesepian: { emoji: "👤", name: "Kesepian (Loneliness)", neuro: "Aktivasi nyeri sosial di ACC -> Menginduksi respon simpatis & inflamasi.", transmitter: "Stimulasi Oksitosin & Pelepasan Endorfin" },
    marah: { emoji: "😡", name: "Marah (Anger)", neuro: "Amygdala Hijack -> Pelepasan Norepinefrin & Adrenalin -> Kerusakan inhibisi PFC.", transmitter: "Supresi Norepinefrin & Aktivasi Kognitif PFC" },
  };

  const neuroRowsHtml = Object.entries(MOOD_RESOLUTIONS_INFO).map(([key, info]: any) => {
    const stats = data?.moodStats30Days?.[key] ?? { uniqueUsers: 0, avgFrequency: 0 };
    return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #f0ede6; font-size: 11px; font-weight: bold;">${info.emoji} ${info.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #f0ede6; font-size: 11px; text-align: center;">${stats.uniqueUsers} orang</td>
        <td style="padding: 8px; border-bottom: 1px solid #f0ede6; font-size: 11px; text-align: center;">${stats.avgFrequency}x / bln</td>
        <td style="padding: 8px; border-bottom: 1px solid #f0ede6; font-size: 10px; line-height: 1.4;">${info.neuro}</td>
        <td style="padding: 8px; border-bottom: 1px solid #f0ede6; font-size: 10px; line-height: 1.4; color: #15803d; font-weight: bold;">${info.transmitter}</td>
      </tr>
    `;
  }).join("");

  const estApiCost = (data?.aiReplyCount ?? 0) * 2.57;

  const html = `
    <html>
    <head>
      <title>Laporan Klinis & Efektivitas Intervensi Neurologi JN-CALM</title>
      <style>
        body {
          font-family: 'system-ui', -apple-system, sans-serif;
          color: #3f3f46;
          background-color: #faf8f5;
          padding: 25px;
          margin: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .container {
          background: white;
          border: 1px solid #e5e2dc;
          border-radius: 20px;
          padding: 30px;
          margin: 0 auto;
          box-shadow: 0 4px 20px rgba(0,0,0,0.01);
        }
        .header {
          text-align: center;
          border-bottom: 2px dashed #e5e2dc;
          padding-bottom: 15px;
          margin-bottom: 25px;
        }
        .logo {
          font-size: 20px;
          font-weight: bold;
          color: #7b8e72;
        }
        .title {
          font-size: 16px;
          font-weight: bold;
          margin-top: 5px;
          color: #27272a;
        }
        .subtitle {
          font-size: 10px;
          color: #71717a;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 3px;
        }
        .stats-grid {
          display: grid;
          grid-template-cols: repeat(5, 1fr);
          gap: 12px;
          margin-bottom: 25px;
        }
        .stats-card {
          border: 1px solid #f0ede6;
          border-radius: 12px;
          padding: 10px;
          background: #fdf9f2;
          text-align: center;
        }
        .stats-label {
          font-size: 9px;
          color: #8b6e51;
          text-transform: uppercase;
          font-weight: bold;
        }
        .stats-value {
          font-size: 14px;
          font-weight: bold;
          margin-top: 5px;
          color: #27272a;
        }
        .section-title {
          font-size: 13px;
          font-weight: bold;
          color: #7b8e72;
          text-transform: uppercase;
          border-left: 3px solid #7b8e72;
          padding-left: 8px;
          margin-top: 25px;
          margin-bottom: 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background: #fdf9f2;
          color: #8b6e51;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          padding: 8px;
          border-bottom: 2px solid #e5e2dc;
        }
        .footer {
          text-align: center;
          font-size: 8px;
          color: #a1a1aa;
          margin-top: 30px;
          border-top: 1px solid #f0ede6;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🧠 JN-CALM RESEARCH DIVISION</div>
          <div class="title">Laporan Analisis Klinis & Efektivitas Intervensi Neurologi</div>
          <div class="subtitle">Data Prevalensi Pengguna & Efikasi Intervensi Darurat</div>
        </div>

        <div class="stats-grid">
          <div class="stats-card">
            <div class="stats-label">Total Jurnal</div>
            <div class="stats-value">${data?.journalCount ?? "—"}</div>
          </div>
          <div class="stats-card">
            <div class="stats-label">Kebiasaan Selesai</div>
            <div class="stats-value">${data?.habitCompletions ?? "—"}</div>
          </div>
          <div class="stats-card">
            <div class="stats-label">Lapar Emosional</div>
            <div class="stats-value">${data?.eatingCount ?? "—"}</div>
          </div>
          <div class="stats-card">
            <div class="stats-label">Total Obrolan AI</div>
            <div class="stats-value">${data?.aiReplyCount ?? "—"}</div>
          </div>
          <div class="stats-card">
            <div class="stats-label">Est. Cost API</div>
            <div class="stats-value">Rp ${Math.round(estApiCost).toLocaleString("id-ID")}</div>
          </div>
        </div>

        <div class="section-title">Hasil Uji Efektivitas Emergency Calm Mode (Clinical Efficacy)</div>
        <p style="font-size: 11px; margin-top: 0; color: #71717a; line-height: 1.5;">
          Tingkat efikasi global: <strong>${data?.feedbackStats?.overallPct ?? 0}%</strong> (dari <strong>${data?.feedbackStats?.total ?? 0} kali intervensi</strong>, sebanyak <strong>${data?.feedbackStats?.helpful ?? 0} sesi</strong> dinilai berhasil menenangkan pengguna secara mandiri). Total pasien unik terbantu: <strong>${data?.feedbackStats?.uniqueHelpedCount ?? 0} orang</strong>.
        </p>

        <table>
          <thead>
            <tr>
              <th style="text-align: left; width: 50%;">Modul Latihan Emergency Calm</th>
              <th style="width: 25%; text-align: center;">Tingkat Efikasi (%)</th>
              <th style="width: 25%; text-align: center;">Jumlah Log Terkumpul</th>
            </tr>
          </thead>
          <tbody>
            ${efficacyRowsHtml}
          </tbody>
        </table>

        <div class="section-title">Prevalensi Emosional & Landasan Patofisiologi Neurosains</div>
        <table>
          <thead>
            <tr>
              <th style="text-align: left; width: 20%;">Kondisi Mental</th>
              <th style="width: 15%; text-align: center;">Prevalensi (Orang)</th>
              <th style="width: 15%; text-align: center;">Intensitas (Frekuensi)</th>
              <th style="text-align: left; width: 25%;">Mekanisme Patofisiologi Saraf</th>
              <th style="text-align: left; width: 25%;">Target Neurotransmiter</th>
            </tr>
          </thead>
          <tbody>
            ${neuroRowsHtml}
          </tbody>
        </table>

        <div class="footer">
          Laporan penelitian ilmiah ini digenerasikan secara otomatis oleh JN-CALM pada ${printTimestamp}. Dokumen ini ditujukan untuk tinjauan riset klinis dan presentasi ilmiah neurologi. 🧬
        </div>
      </div>
    </body>
    </html>
  `;
  triggerPrint(html);
}

