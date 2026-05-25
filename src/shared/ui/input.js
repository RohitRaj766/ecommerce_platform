export function Input({ className = "", ...props }) {
  return <input className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-sky-400 ${className}`} {...props} />;
}