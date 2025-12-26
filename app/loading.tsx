// app/loading.tsx
export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* CSS Spinner */}
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-t-transparent"></div>
        
        <p className="text-lg font-semibold text-gray-700">Loading...</p>
      </div>
    </div>
  );
}