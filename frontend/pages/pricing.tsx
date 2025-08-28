import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PLANS = [
  { key: "STARTER", name: "Starter", price: "$19/mo",
    features: ["5 hrs audio", "Summaries", "Show notes", "Snippets"],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || "" },
  { key: "PRO", name: "Pro", price: "$49/mo",
    features: ["20 hrs", "All features", "SEO", "Newsletter"],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "" },
  { key: "AGENCY", name: "Agency", price: "$99/mo",
    features: ["Unlimited*", "Teams", "White-label export"],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY || "" },
];

export default function PricingPage() {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    try {
      if (!priceId) throw new Error("Missing priceId"); // <- clearer error
      setLoadingKey(priceId);

      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const { sessionId, error } = await res.json();
      if (error) throw new Error(error);

      const stripe = await stripePromise;
      await stripe!.redirectToCheckout({ sessionId });
    } catch (e:any) {
      alert(e.message || "Checkout failed");
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Pricing</h1>
        <p className="text-slate-600 mb-8">Simple plans that scale with you.</p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map(p => (
            <div key={p.key} className="rounded-2xl border shadow-sm p-6">
              <h2 className="text-xl font-semibold">{p.name}</h2>
              <div className="text-3xl font-bold mt-2">{p.price}</div>
              <ul className="mt-4 space-y-2 text-slate-700">
                {p.features.map((f, i) => <li key={i}>• {f}</li>)}
              </ul>
              <button
                onClick={() => handleCheckout(p.priceId)}
                disabled={!p.priceId || loadingKey === p.priceId}
                className="mt-6 w-full rounded-md bg-[#9CEE69] text-slate-900 font-semibold py-2 hover:brightness-95 disabled:opacity-60"
              >
                {loadingKey === p.priceId ? "Starting..." : (p.priceId ? "Start now" : "Missing priceId")}
              </button>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-500 mt-6">*Fair use policy applies.</p>
      </div>
    </div>
  );
}
