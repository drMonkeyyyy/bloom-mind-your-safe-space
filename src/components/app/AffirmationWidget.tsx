import { useState, useEffect } from "react";

const AFFIRMATIONS = [
  "Hari ini kamu sudah melakukan yang terbaik! 🌸",
  "Pelan-pelan saja, setiap langkah kecil itu berharga. 🐢",
  "Jangan lupa minum air putih dan tersenyum hari ini! 💧",
  "Kamu itu berharga dan disayangi apa adanya. 💛",
  "Napas dulu yang dalam... semuanya akan baik-baik saja. 🌬️",
  "Bunga butuh waktu untuk mekar, begitu juga kamu. 🌸",
  "Mendung pasti lewat, matahari akan bersinar lagi! ☀️",
  "Tidak apa-apa untuk beristirahat sejenak hari ini. 🛌",
  "Kamu lebih kuat dari apa yang kamu pikirkan! 💪",
  "Hargai dirimu sendiri atas perjuanganmu sejauh ini. 🏆",
  "Hal baik sedang berjalan menuju kepadamu! ✨",
];

export function AffirmationWidget() {
  const [quote, setQuote] = useState("");
  useEffect(() => {
    const day = new Date().getDate();
    setQuote(AFFIRMATIONS[day % AFFIRMATIONS.length]);
  }, []);

  return (
    <div className="mx-3 my-2 p-3.5 bg-gradient-to-br from-teal-50/80 to-emerald-50/50 rounded-2xl border border-teal-100/60 shadow-[0_4px_12px_rgba(20,184,166,0.04)] flex items-center gap-3 overflow-hidden relative group">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-cloud {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(2deg); }
        }
        .animate-float-cloud {
          animation: float-cloud 3s infinite ease-in-out;
        }
      `}} />
      
      {/* Cloud Character */}
      <div className="relative shrink-0 text-3xl animate-float-cloud select-none">
        ☁️
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold text-teal-700/90 uppercase tracking-[0.18em] leading-none">
          KATA HARI INI
        </p>
        <p className="text-[11.5px] font-semibold text-teal-950/90 leading-relaxed mt-1.5">
          "{quote}"
        </p>
      </div>
    </div>
  );
}
