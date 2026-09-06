export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
      <p className="text-lg text-slate-600 mb-8">
        This page could not be found.
      </p>
      <a
        href="/"
        className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium"
      >
        Go Home
      </a>
    </div>
  );
}