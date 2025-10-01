import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, User, Video, MapPin, FileText } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  type: 'presencial' | 'virtual';
  status: 'confirmada' | 'cancelada' | 'completada' | 'no-show';
  notes: string | null;
  patient: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

interface AgendaViewProps {
  onStartConsultation: (appointment: Appointment) => void;
}

export function AgendaView({ onStartConsultation }: AgendaViewProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, selectedDate]);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:profiles!appointments_patient_id_fkey(full_name, email, phone)
      `)
      .eq('professional_id', user?.id)
      .eq('appointment_date', selectedDate)
      .order('start_time', { ascending: true });

    if (!error && data) {
      setAppointments(data as any);
    }
    setLoading(false);
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId);

    if (!error) {
      await fetchAppointments();
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

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const isCurrentAppointment = (date: string, startTime: string, endTime: string) => {
    const now = new Date();
    const appointmentDate = new Date(date);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const start = new Date(appointmentDate);
    start.setHours(startHour, startMinute, 0, 0);

    const end = new Date(appointmentDate);
    end.setHours(endHour, endMinute, 0, 0);

    return now >= start && now <= end;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <h3 className="text-lg font-semibold text-slate-900">Seleccionar Fecha</h3>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
          />
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">Cargando agenda...</div>
      ) : appointments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No hay citas programadas para esta fecha</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => {
            const isCurrent = isCurrentAppointment(
              appointment.appointment_date,
              appointment.start_time,
              appointment.end_time
            );

            return (
              <Card
                key={appointment.id}
                className={isCurrent ? 'ring-2 ring-teal-500' : ''}
                hover
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {isCurrent && (
                        <Badge variant="success" size="sm">
                          En curso
                        </Badge>
                      )}

                      <div className="flex items-center gap-3 mt-2 mb-3">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                          </span>
                        </div>
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
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-500" />
                          <span className="font-medium text-slate-900">
                            {appointment.patient.full_name}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span>{appointment.patient.email}</span>
                          {appointment.patient.phone && (
                            <span>{appointment.patient.phone}</span>
                          )}
                        </div>

                        {appointment.notes && (
                          <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-700">{appointment.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-3">
                        {getStatusBadge(appointment.status)}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {appointment.status === 'confirmada' && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => onStartConsultation(appointment)}
                          >
                            {appointment.type === 'virtual' ? 'Iniciar' : 'Atender'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(appointment.id, 'completada')}
                          >
                            Completar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStatusChange(appointment.id, 'no-show')}
                          >
                            No asistió
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
