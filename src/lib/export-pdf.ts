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

export function exportWeeklyInsightPDF(dateStr: string, text: string) {
  const formattedDate = formatDateIndo(dateStr);
  const printTimestamp = getTimestampIndo();

  const html = `
    <html>
    <head>
      <title>JN-CALM - Weekly AI Insight</title>
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
          <div class="title">Analisis Mingguan AI (Weekly Insight)</div>
          <div class="date">${formattedDate}</div>
        </div>

        <div class="content-box">
          ${text}
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

