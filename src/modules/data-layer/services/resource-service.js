import { requestMock, updateMock } from "@/shared/services/api-client";

let records = [
  { id: 1, title: "Configure cache layer", status: "todo" },
  { id: 2, title: "Review optimistic updates", status: "doing" },
  { id: 3, title: "Document cancellation flow", status: "done" },
];

export function fetchRecords({ signal } = {}) {
  return requestMock("records:list", () => records, { delay: 450, signal, retries: 2 });
}

export function createRecord(title) {
  return updateMock(() => {
    const nextRecord = { id: Date.now(), title, status: "todo" };
    records = [nextRecord, ...records];
    return nextRecord;
  });
}