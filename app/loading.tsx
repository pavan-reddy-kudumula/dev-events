// app/loading.tsx
export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* CSS Spinner */}
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-t-transparent"></div>
        
        <p className="text-lg font-semibold text-gray-300">Loading...</p>
      </div>
    </div>
  );
}