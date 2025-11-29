const Loading = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-[#0f172a] text-white">
    <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(37,99,235,0.3)]"></div>
    <p className="text-slate-400 text-sm font-medium tracking-wide animate-pulse">
      LOADING...
    </p>
  </div>
);

export default Loading;
