export default function VerifyPage() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-8 text-center">
      <div className="text-5xl mb-4">📧</div>
      <h2 className="text-2xl font-bold text-navy-900 mb-2">
        Revisa tu email
      </h2>
      <p className="text-navy-500">
        Te hemos enviado un enlace de acceso. Haz clic en el enlace del email
        para continuar.
      </p>
      <p className="text-navy-400 text-sm mt-4">
        Si no lo encuentras, revisa la carpeta de spam.
      </p>
    </div>
  );
}
