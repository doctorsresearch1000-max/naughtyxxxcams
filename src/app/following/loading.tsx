export default function FollowingLoading() {
  return (
    <main
      className="mx-auto min-h-screen w-full max-w-md animate-pulse bg-[#0A0A0A] px-4 pb-24 pt-3 text-white"
    >
      <div className="mb-6 h-20 rounded-2xl bg-[#1C1C1E]" />
      <div className="mb-3 h-8 w-40 rounded-lg bg-[#1C1C1E]" />
      <div className="grid grid-cols-2 gap-3">
        <div className="aspect-[3/4] rounded-[22px] bg-[#1C1C1E]" />
        <div className="aspect-[3/4] rounded-[22px] bg-[#1C1C1E]" />
      </div>
    </main>
  );
}
