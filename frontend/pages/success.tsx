export default function Success() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold">🎉 You’re all set!</h1>
        <p className="text-slate-600 mt-2">Your subscription is active. You can start generating now.</p>
        <a href="/" className="inline-block mt-6 rounded-md bg-[#9CEE69] text-slate-900 font-semibold px-4 py-2">Go to app</a>
      </div>
    </div>
  );
}
