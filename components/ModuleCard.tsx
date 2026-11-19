import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  sub: string;
  icon: LucideIcon;
  bg: string;
  onClick: () => void;
};

export default function ModuleCard({ label, sub, icon: Icon, bg, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-3 rounded-3xl p-5 text-center transition hover:opacity-90 active:scale-95 cursor-pointer w-full"
      style={{ background: bg }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.18)" }}
      >
        <Icon size={28} className="text-white" />
      </div>
      <div>
        <p className="text-sm font-bold text-white leading-tight">{label}</p>
        {sub && (
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>
            {sub}
          </p>
        )}
      </div>
    </button>
  );
}
