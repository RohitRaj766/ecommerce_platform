"use client";

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { useApiMutation } from '@/shared/hooks/use-api-mutation';
import { createRecord } from '@/modules/data-layer/services/resource-service';
import { useQueryClient } from '@tanstack/react-query';

export function MutationDemo() {
  const [title, setTitle] = useState('New task');
  const [simulateFail, setSimulateFail] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useApiMutation({
    mutationFn: ({ title, fail }) => {
      if (fail) return Promise.reject(new Error('Simulated failure'));
      return createRecord(title);
    },
    invalidateKeys: [['records']],
    onOptimisticUpdate: (qc, variables) => {
      const current = qc.getQueryData(['records']) ?? [];
      qc.setQueryData(['records'], [{ id: 'optimistic', title: variables.title, status: 'todo' }, ...current]);
    },
  });

  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-900">Mutation flow (optimistic)</p>
          <p className="mt-1 text-xs text-slate-500">Toggle failure to demonstrate rollback.</p>
        </div>
        <div className="flex items-center gap-2">
          <input id="fail" type="checkbox" checked={simulateFail} onChange={(e) => setSimulateFail(e.target.checked)} />
          <label htmlFor="fail" className="text-sm text-slate-600">Simulate failure</label>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl border px-3 py-2" />
        <Button
          onClick={() => {
            mutation.mutate({ title, fail: simulateFail });
          }}
        >
          Save
        </Button>
        <Button variant="ghost" onClick={() => queryClient.invalidateQueries(['records'])}>
          Invalidate
        </Button>
      </div>

      <div className="mt-3 text-sm text-slate-600">
        <div>State: {mutation.status}</div>
        <div>IsPending: {String(mutation.isLoading)}</div>
        <div>Last error: {mutation.error?.message ?? 'none'}</div>
      </div>
    </Card>
  );
}
