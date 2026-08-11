export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[60vh] gap-4">
      <div className="relative w-16 h-16 animate-pulse">
        <img 
          src="/logo-icon.png" 
          alt="Loading..." 
          className="w-full h-full object-contain rounded-full shadow-lg border border-outline-variant/30 animate-[spin_3s_linear_infinite]"
        />
      </div>
      <p className="text-[14px] font-bold text-on-surface-variant animate-pulse tracking-wide mt-2">Loading...</p>
    </div>
  )
}
