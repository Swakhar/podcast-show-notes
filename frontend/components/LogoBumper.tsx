import { useEffect, useState } from "react";

export default function LogoBumper() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1600);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-white pointer-events-none animate-bumper-fade">
      <div className="relative">
        {/* Icon pulses in */}
        <img src="/castlumen-icon.svg" alt="CastLumen" className="h-20 w-20 rounded-2xl animate-bumper-pop" />
        {/* Beam sweep */}
        <span className="absolute inset-0 -skew-x-6 animate-bumper-sheen pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent 40%, rgba(255,255,255,.75) 50%, transparent 60%)" }} />
      </div>
    </div>
  );
}
