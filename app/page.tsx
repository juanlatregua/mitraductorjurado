export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-navy-900 text-white px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold mb-4">
          mitraductorjurado
          <span className="text-accent-400">.es</span>
        </h1>
        <p className="text-xl text-navy-300 mb-8">
          El sistema operativo del traductor jurado.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/auth/login"
            className="bg-accent-500 hover:bg-accent-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Acceder
          </a>
          <a
            href="/traductores"
            className="border border-navy-400 hover:border-accent-400 text-navy-200 hover:text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Soy traductor jurado
          </a>
        </div>
      </div>
    </main>
  );
}
