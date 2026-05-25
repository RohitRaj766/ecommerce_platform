import { FlowBlock } from '@/shared/ui/flow-block';

export function FlowDiagram() {
  const steps = [
    { title: 'UI Component', caption: 'Presentational layer / hooks consumer' },
    { title: 'Reusable Hook', caption: 'useApiQuery / useApiMutation' },
    { title: 'TanStack Query', caption: 'Client-side cache & orchestration' },
    { title: 'API Client', caption: 'Centralized transport, retry, dedupe' },
    { title: 'Route Handler', caption: 'Server route / handler' },
    { title: 'Database', caption: 'Persistent storage (simulated)' },
  ];

  return (
    <div className="space-y-3">
      {steps.map((s, i) => (
        <div key={s.title} className="flex items-center gap-3">
          <div className="flex-1">
            <FlowBlock title={s.title} caption={s.caption} />
          </div>
          {i < steps.length - 1 && <div className="text-slate-400">→</div>}
        </div>
      ))}
    </div>
  );
}
