export default function ProfileLoading() {
  return (
    <main
      className="mx-auto min-h-screen w-full max-w-md animate-pulse bg-[#0A0A0A] pb-24 text-white"
    >
      <div className="mx-3 mt-2 h-[min(50vh,400px)] rounded-[28px] bg-[#1C1C1E]" />
      <div className="mx-auto -mt-10 h-24 w-24 rounded-full bg-zinc-800" />
      <div className="mx-auto mt-6 h-6 w-48 rounded bg-zinc-800" />
    </main>
  );
}
