export default function IdeaLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="h-16 w-16 rounded-full bg-muted" />
        <div className="h-6 w-48 rounded-lg bg-muted" />
        <div className="h-4 w-64 rounded-lg bg-muted" />
      </div>
    </div>
  );
}
