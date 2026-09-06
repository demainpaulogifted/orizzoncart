export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Temporary simple homepage */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-4">
          ORIZZONCART
        </h1>
        <p className="text-lg text-slate-600 max-w-md mb-8">
          Premium multi-tenant e-commerce platform for Nigerian businesses.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="px-8 py-3 bg-slate-900 text-white rounded-lg font-medium">
            Create Your Online Store
          </button>
          <button className="px-8 py-3 border border-slate-300 rounded-lg font-medium">
            Explore OrizzonCart
          </button>
        </div>
        <p className="mt-12 text-sm text-slate-400">
          Powered by OrizzonS Inc.
        </p>
      </div>
    </main>
  );
}