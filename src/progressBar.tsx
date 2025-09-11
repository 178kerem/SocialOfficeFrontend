

type Props = {
  value: number;
  barClass?: string;
  label?: string;
};

export default function SoftProgress({ value, barClass, label }: Props) {
  return (
    <div className="w-full">
      <div className="relative h-3.5 w-full overflow-hidden rounded-full bg-emerald-100">
        <div
          className={`absolute left-0 top-0 h-full transition-[width] duration-300 ${
            barClass ?? "bg-emerald-400"
          }`}
          style={{ width: `${value}%` }}
        />
        <div className="absolute inset-0 grid place-items-center text-[10px] font-semibold text-white drop-shadow">
          {label ?? `${value}%`}
        </div>
      </div>
    </div>
  );
}
