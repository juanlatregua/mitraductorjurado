export function KPICard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-navy-100 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-navy-500">{title}</p>
          <p className="text-3xl font-bold text-navy-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-navy-400 mt-1">{subtitle}</p>
          )}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}
