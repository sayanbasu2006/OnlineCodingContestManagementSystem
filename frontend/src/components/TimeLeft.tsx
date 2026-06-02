import { useState, useEffect } from "react";

interface TimeLeftProps {
  targetTime: string;
  prefix?: string;
  showSeconds?: boolean;
  className?: string;
}

export default function TimeLeft({ targetTime, prefix = "", showSeconds = false, className = "" }: TimeLeftProps) {
  const [text, setText] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetTime).getTime() - Date.now();
      if (diff <= 0) { setText("Ended"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      
      if (h > 24) {
        setText(`${prefix}${Math.floor(h / 24)}d ${h % 24}h`);
      } else if (showSeconds) {
        const s = Math.floor((diff % 60000) / 1000);
        setText(`${prefix}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      } else {
        setText(`${prefix}${h}h ${m}m`);
      }
    };
    update();
    const intervalTime = showSeconds ? 1000 : 60000;
    const id = setInterval(update, intervalTime);
    return () => clearInterval(id);
  }, [targetTime, prefix, showSeconds]);

  if (!text) return null;
  return <span className={className}>{text}</span>;
}
