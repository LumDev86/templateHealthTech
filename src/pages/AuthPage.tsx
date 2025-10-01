import { useState } from 'react';
import { Heart } from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="hidden lg:block">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-600 rounded-2xl mb-4">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">
              Portal de Coordinación
              <br />
              de Salud
            </h1>
            <p className="text-lg text-slate-600 max-w-md mx-auto">
              Gestiona tus citas médicas, consulta tu historial y accede a teleconsultas de forma
              segura y eficiente.
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="text-3xl font-bold text-teal-600 mb-1">100%</div>
                <div className="text-sm text-slate-600">Seguro y Privado</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="text-3xl font-bold text-teal-600 mb-1">24/7</div>
                <div className="text-sm text-slate-600">Disponibilidad</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md mx-auto">
            <div className="lg:hidden mb-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-xl mb-3">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Portal de Salud</h2>
            </div>

            {isLogin ? (
              <LoginForm onToggleForm={() => setIsLogin(false)} />
            ) : (
              <SignupForm onToggleForm={() => setIsLogin(true)} />
            )}
          </div>

          <div className="mt-6 text-center text-sm text-slate-600 max-w-md mx-auto">
            <p>
              Protegido con encriptación de grado empresarial. Tus datos están seguros y nunca se
              comparten sin tu consentimiento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
