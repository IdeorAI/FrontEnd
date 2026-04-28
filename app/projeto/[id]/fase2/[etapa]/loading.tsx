export default function EtapaLoading() {
  return (
    <div className="flex min-h-screen flex-col gap-6 p-6 animate-pulse">
      <div className="h-6 w-32 rounded-lg bg-muted" />
      <div className="h-12 w-2/3 rounded-xl bg-muted" />
      <div className="h-64 rounded-xl bg-muted" />
      <div className="flex gap-3">
        <div className="h-10 w-32 rounded-lg bg-muted" />
        <div className="h-10 w-32 rounded-lg bg-muted" />
      </div>
    </div>
  );
}
