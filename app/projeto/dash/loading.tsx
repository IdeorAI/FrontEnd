export default function DashLoading() {
  return (
    <div className="flex min-h-screen flex-col gap-6 p-6 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-muted" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
