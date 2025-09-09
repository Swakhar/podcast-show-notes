export function StageTimeline({ stage }: { stage?: string }) {
  const steps = [
    "inspecting URL","fetching captions","downloading audio","preparing preview",
    "transcribing","generating summary","generating show notes","generating timestamps",
    "generating social snippets","generating SEO","generating newsletter","finished"
  ];
  const idx = stage ? steps.findIndex(s => s === stage) : -1;
  return (
    <ol className="flex flex-wrap gap-2 text-xs">
      {steps.map((s,i)=>(
        <li key={s} className={`px-2 py-1 rounded-full border ${i<=idx?"bg-[#9CEE69] border-[#9CEE69] text-slate-900":"bg-white border-slate-200 text-slate-500"}`}>
          {s.replace("generating ","")}
        </li>
      ))}
    </ol>
  );
}
