import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AlertCircle } from 'lucide-react';

interface SignupFormProps {
  onToggleForm: () => void;
}

export function SignupForm({ onToggleForm }: SignupFormProps) {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'patient' as 'patient' | 'professional',
    phone: '',
    specialty: '',
    licenseNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    const additionalData = formData.role === 'professional' ? {
      phone: formData.phone,
      specialty: formData.specialty,
      licenseNumber: formData.licenseNumber,
    } : {
      phone: formData.phone,
    };

    const { error } = await signUp(
      formData.email,
      formData.password,
      formData.fullName,
      formData.role,
      additionalData
    );

    if (error) {
      setError(error.message || 'Error al crear la cuenta');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Crear Cuenta</h2>
        <p className="text-slate-600">Únete a nuestra plataforma de salud</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de cuenta</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'patient' })}
            className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
              formData.role === 'patient'
                ? 'border-teal-600 bg-teal-50 text-teal-700'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            Paciente
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'professional' })}
            className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
              formData.role === 'professional'
                ? 'border-teal-600 bg-teal-50 text-teal-700'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            Profesional
          </button>
        </div>
      </div>

      <Input
        type="text"
        label="Nombre completo"
        value={formData.fullName}
        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        placeholder="Juan Pérez"
        required
      />

      <Input
        type="email"
        label="Correo electrónico"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="tu@ejemplo.com"
        required
      />

      <Input
        type="tel"
        label="Teléfono"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        placeholder="+34 600 000 000"
      />

      {formData.role === 'professional' && (
        <>
          <Input
            type="text"
            label="Especialidad"
            value={formData.specialty}
            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
            placeholder="Cardiología"
            required
          />
          <Input
            type="text"
            label="Número de colegiado"
            value={formData.licenseNumber}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
            placeholder="12345678"
            required
          />
        </>
      )}

      <Input
        type="password"
        label="Contraseña"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="••••••••"
        helperText="Mínimo 6 caracteres"
        required
      />

      <Input
        type="password"
        label="Confirmar contraseña"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        placeholder="••••••••"
        required
      />

      <Button type="submit" fullWidth disabled={loading}>
        {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
      </Button>

      <div className="text-center">
        <p className="text-sm text-slate-600">
          ¿Ya tienes cuenta?{' '}
          <button
            type="button"
            onClick={onToggleForm}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Iniciar sesión
          </button>
        </p>
      </div>
    </form>
  );
}
