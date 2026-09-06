import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-hero-gradient flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 drop-shadow-lg font-display">
          OrizzonCart
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto drop-shadow-md">
          Premium multi-tenant e-commerce platform for Nigerian businesses.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link href="/signup" className="btn-primary text-lg">
            Create Your Online Store
          </Link>
          <Link href="/explore" className="btn-secondary text-lg bg-white/90">
            Explore OrizzonCart
          </Link>
        </div>

        <p className="mt-16 text-white/70 text-sm">
          Powered by OrizzonS Inc.
        </p>
      </div>
    </main>
  );
}