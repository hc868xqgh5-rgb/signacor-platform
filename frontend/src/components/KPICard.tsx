interface KPICardProps {
  label: string;
  value: string;
  subValue?: string;
  sub?: string;
  icon?: string;
  accent?: string;
  trend?: { value: number; label: string };
  color?: 'default' | 'green' | 'blue' | 'orange' | 'red';
}

export default function KPICard({
  label,
  value,
  subValue,
  sub,
  icon,
  accent,
  trend,
}: KPICardProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      {icon && <span className="mt-0.5 text-2xl">{icon}</span>}

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
        <p className={`mt-0.5 text-xl font-black ${accent || 'text-gray-900'}`}>{value}</p>

        {(subValue || sub) && (
          <p className="mt-0.5 text-xs text-gray-400">{subValue || sub}</p>
        )}

        {trend && (
          <div className="mt-2 flex items-center gap-1">
            <span
              className={`text-xs font-bold ${
                trend.value >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
            </span>
            <span className="text-xs text-gray-400">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
