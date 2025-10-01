import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, Settings, LogOut, Video } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { AgendaView } from '../components/professional/AgendaView';
import { AvailabilitySettings } from '../components/professional/AvailabilitySettings';
import { Modal } from '../components/ui/Modal';

interface Appointment {
  id: string;
  patient: {
    full_name: string;
  };
}

export function ProfessionalDashboard() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'agenda' | 'availability'>('agenda');
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const handleStartConsultation = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowConsultationModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Portal Profesional</h1>
                <p className="text-xs text-slate-600">
                  {profile?.specialty || 'Profesional de la Salud'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{profile?.full_name}</p>
                <p className="text-xs text-slate-600">{profile?.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="py-4">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('agenda')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      activeTab === 'agenda'
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-5 h-5" />
                    Mi Agenda
                  </button>
                  <button
                    onClick={() => setActiveTab('availability')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      activeTab === 'availability'
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    Disponibilidad
                  </button>
                </nav>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent className="py-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Video className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="font-medium text-slate-900 mb-1">Teleconsulta</h3>
                  <p className="text-xs text-slate-600 mb-3">
                    Inicia una videollamada desde la agenda
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'agenda' && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Mi Agenda</h2>
                <AgendaView onStartConsultation={handleStartConsultation} />
              </div>
            )}

            {activeTab === 'availability' && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Configurar Disponibilidad
                </h2>
                <AvailabilitySettings />
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showConsultationModal}
        onClose={() => setShowConsultationModal(false)}
        title="Sala de Consulta"
        size="xl"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            <div className="bg-slate-100 rounded-lg aspect-video flex items-center justify-center">
              <div className="text-center">
                <Video className="w-16 h-16 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">Simulación de videollamada</p>
                <p className="text-sm text-slate-500 mt-1">
                  Paciente: {selectedAppointment.patient.full_name}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button variant="danger" size="lg">
                Finalizar Llamada
              </Button>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-slate-900 mb-3">Notas de la Consulta</h4>
              <textarea
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-32"
                placeholder="Escribe notas sobre la consulta..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
