type Props = {
  label: string;
  value: string | number;
  color: string;
  bg: string;
  onClick?: () => void;
};

export default function StatTile({ label, value, color, bg, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl px-4 py-3 flex flex-col gap-0.5 text-left transition hover:opacity-80 active:scale-95 w-full"
      style={{ background: bg }}
    >
      <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
      <p className="text-xs font-medium text-gray-500">{label}</p>
    </button>
  );
}
