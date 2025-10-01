import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, User, Video, MapPin, X } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal, ModalFooter } from '../ui/Modal';

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  type: 'presencial' | 'virtual';
  status: 'confirmada' | 'cancelada' | 'completada' | 'no-show';
  notes: string | null;
  room_id: string | null;
  professional: {
    full_name: string;
    specialty: string | null;
  };
}

export function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        professional:profiles!appointments_professional_id_fkey(full_name, specialty)
      `)
      .eq('patient_id', user?.id)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (!error && data) {
      setAppointments(data as any);
    }
    setLoading(false);
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelada' })
      .eq('id', selectedAppointment.id);

    if (!error) {
      await fetchAppointments();
      setShowCancelModal(false);
      setSelectedAppointment(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
      confirmada: 'success',
      completada: 'info',
      cancelada: 'error',
      'no-show': 'warning',
    };
    const labels: Record<string, string> = {
      confirmada: 'Confirmada',
      completada: 'Completada',
      cancelada: 'Cancelada',
      'no-show': 'No asistió',
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const isPastAppointment = (date: string, time: string) => {
    const appointmentDateTime = new Date(`${date}T${time}`);
    return appointmentDateTime < new Date();
  };

  const upcomingAppointments = appointments.filter(
    apt => !isPastAppointment(apt.appointment_date, apt.start_time) && apt.status === 'confirmada'
  );

  const pastAppointments = appointments.filter(
    apt => isPastAppointment(apt.appointment_date, apt.start_time) || apt.status !== 'confirmada'
  );

  if (loading) {
    return <div className="text-center py-8">Cargando citas...</div>;
  }

  return (
    <div className="space-y-6">
      {upcomingAppointments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Próximas Citas</h3>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <Card key={appointment.id} hover>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {formatDate(appointment.appointment_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {formatTime(appointment.start_time)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-slate-500" />
                        <span className="font-medium text-slate-900">
                          {appointment.professional.full_name}
                        </span>
                        {appointment.professional.specialty && (
                          <span className="text-sm text-slate-600">
                            - {appointment.professional.specialty}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          {appointment.type === 'virtual' ? (
                            <>
                              <Video className="w-4 h-4 text-teal-600" />
                              <span className="text-sm text-slate-700">Virtual</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-4 h-4 text-teal-600" />
                              <span className="text-sm text-slate-700">Presencial</span>
                            </>
                          )}
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {appointment.type === 'virtual' && (
                        <Button size="sm" variant="primary">
                          Unirse
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowCancelModal(true);
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {pastAppointments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Historial de Citas</h3>
          <div className="space-y-4">
            {pastAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="py-4 opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {formatDate(appointment.appointment_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {formatTime(appointment.start_time)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-slate-500" />
                        <span className="font-medium text-slate-900">
                          {appointment.professional.full_name}
                        </span>
                        {appointment.professional.specialty && (
                          <span className="text-sm text-slate-600">
                            - {appointment.professional.specialty}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          {appointment.type === 'virtual' ? (
                            <>
                              <Video className="w-4 h-4 text-slate-500" />
                              <span className="text-sm text-slate-700">Virtual</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-4 h-4 text-slate-500" />
                              <span className="text-sm text-slate-700">Presencial</span>
                            </>
                          )}
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {appointments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No tienes citas programadas</p>
            <p className="text-sm text-slate-500 mt-1">Agenda tu primera consulta</p>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancelar Cita"
      >
        <p className="text-slate-700">
          ¿Estás seguro de que deseas cancelar esta cita?
        </p>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowCancelModal(false)}>
            Volver
          </Button>
          <Button variant="danger" onClick={handleCancelAppointment}>
            Cancelar Cita
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
