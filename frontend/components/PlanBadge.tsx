export function planLabel(plan?: string) {
  if (plan === "AGENCY") return "Agency";
  if (plan === "PRO") return "Pro";
  if (plan === "STARTER") return "Starter";
  return "Free";
}

export default function PlanBadge({ plan }: { plan?: string }) {
  if (!plan) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border">
      Current plan: {planLabel(plan)}
    </span>
  );
}
