export default function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200/70 rounded ${className}`} />;
}
