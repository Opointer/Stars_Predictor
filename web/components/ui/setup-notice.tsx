export function SetupNotice({ message }: { message: string }) {
  return (
    <div className="panel-surface rounded-[1.75rem] border-danger/20 bg-danger/5 p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-danger">Setup required</p>
      <p className="mt-3 text-sm leading-6 text-slate-200">{message}</p>
    </div>
  );
}
