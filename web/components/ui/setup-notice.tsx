export function SetupNotice({ message }: { message: string }) {
  return (
    <div className="rounded-[1.5rem] border border-danger/20 bg-white p-6 shadow-panel">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-danger">Setup required</p>
      <p className="mt-2 text-sm text-slate-700">{message}</p>
    </div>
  );
}
