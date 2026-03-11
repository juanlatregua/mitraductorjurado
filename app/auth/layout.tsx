export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-navy-50 flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <a href="/" className="inline-block">
          <h1 className="text-3xl font-bold text-navy-900">
            mitraductorjurado
            <span className="text-accent-500">.es</span>
          </h1>
        </a>
        <p className="text-navy-500 mt-1 text-sm">
          El sistema operativo del traductor jurado
        </p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
