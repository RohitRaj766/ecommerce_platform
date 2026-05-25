import { Card } from './card';

export function OverviewCard({ title, subtitle, children }) {
  return (
    <Card>
      <div>
        {title && <p className="text-sm font-semibold text-slate-900">{title}</p>}
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </Card>
  );
}
