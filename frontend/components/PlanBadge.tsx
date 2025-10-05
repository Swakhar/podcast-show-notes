import { useTranslation } from 'next-i18next';

export function planLabel(plan?: string, t?: any) {
  if (!t) {
    // Fallback for cases where translation isn't available
    if (plan === "AGENCY") return "Agency";
    if (plan === "PRO") return "Pro";
    if (plan === "STARTER") return "Starter";
    return "Free";
  }
  
  if (plan === "AGENCY") return t('planBadge.plans.AGENCY');
  if (plan === "PRO") return t('planBadge.plans.PRO');
  if (plan === "STARTER") return t('planBadge.plans.STARTER');
  return t('planBadge.plans.FREE');
}

export default function PlanBadge({ plan }: { plan?: string }) {
  const { t } = useTranslation('common');
  
  if (!plan) return null;
  
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border">
      {t('planBadge.currentPlan')}: {planLabel(plan, t)}
    </span>
  );
}
