import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, FileText, LogOut } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { AvailabilityCalendar } from '../components/patient/AvailabilityCalendar';
import { PatientAppointments } from '../components/patient/PatientAppointments';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { supabase } from '../lib/supabase';

export function PatientDashboard() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'appointments' | 'book' | 'records'>('appointments');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    professionalId: string;
    date: string;
    startTime: string;
    endTime: string;
    type: 'presencial' | 'virtual';
  } | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleSelectSlot = (
    professionalId: string,
    date: string,
    startTime: string,
    endTime: string,
    type: 'presencial' | 'virtual'
  ) => {
    setSelectedSlot({ professionalId, date, startTime, endTime, type });
    setShowConfirmModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !profile) return;

    const { error } = await supabase.from('appointments').insert({
      patient_id: profile.id,
      professional_id: selectedSlot.professionalId,
      appointment_date: selectedSlot.date,
      start_time: selectedSlot.startTime,
      end_time: selectedSlot.endTime,
      type: selectedSlot.type,
      status: 'confirmada',
    });

    if (!error) {
      setBookingSuccess(true);
      setShowConfirmModal(false);
      setTimeout(() => {
        setBookingSuccess(false);
        setActiveTab('appointments');
      }, 2000);
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Portal de Salud</h1>
                <p className="text-xs text-slate-600">Paciente</p>
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
        {bookingSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">Cita reservada con éxito</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="py-4">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      activeTab === 'appointments'
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-5 h-5" />
                    Mis Citas
                  </button>
                  <button
                    onClick={() => setActiveTab('book')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      activeTab === 'book'
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                    Reservar Cita
                  </button>
                  <button
                    onClick={() => setActiveTab('records')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      activeTab === 'records'
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    Historial Médico
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'appointments' && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Mis Citas</h2>
                <PatientAppointments />
              </div>
            )}

            {activeTab === 'book' && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Reservar Cita</h2>
                <AvailabilityCalendar onSelectSlot={handleSelectSlot} />
              </div>
            )}

            {activeTab === 'records' && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Historial Médico</h2>
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">Tu historial médico aparecerá aquí</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Después de tus consultas, podrás ver tus diagnósticos y tratamientos
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar Reserva"
      >
        {selectedSlot && (
          <div className="space-y-4">
            <p className="text-slate-700">
              ¿Confirmas la reserva de tu cita con los siguientes detalles?
            </p>
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-700">
                  {new Date(selectedSlot.date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-700">
                  {formatTime(selectedSlot.startTime)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Tipo: {selectedSlot.type === 'virtual' ? 'Virtual' : 'Presencial'}
                </span>
              </div>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowConfirmModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirmBooking}>
            Confirmar Reserva
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
