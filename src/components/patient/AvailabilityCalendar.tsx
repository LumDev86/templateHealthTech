import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, Clock, Video, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent } from '../ui/Card';

interface Professional {
  id: string;
  full_name: string;
  specialty: string | null;
}

interface TimeSlot {
  start_time: string;
  end_time: string;
  available: boolean;
}

interface AvailabilityCalendarProps {
  onSelectSlot: (professionalId: string, date: string, startTime: string, endTime: string, type: 'presencial' | 'virtual') => void;
}

export function AvailabilityCalendar({ onSelectSlot }: AvailabilityCalendarProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<'presencial' | 'virtual'>('presencial');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  useEffect(() => {
    if (selectedProfessional && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedProfessional, selectedDate]);

  const fetchProfessionals = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, specialty')
      .eq('role', 'professional');

    if (!error && data) {
      setProfessionals(data);
    }
  };

  const fetchAvailableSlots = async () => {
    setLoading(true);
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();

    const { data: slots } = await supabase
      .from('availability_slots')
      .select('start_time, end_time')
      .eq('professional_id', selectedProfessional)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true);

    if (slots) {
      const { data: appointments } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('professional_id', selectedProfessional)
        .eq('appointment_date', selectedDate)
        .in('status', ['confirmada', 'completada']);

      const occupiedTimes = new Set(
        appointments?.map(apt => apt.start_time) || []
      );

      const available = slots.map(slot => ({
        start_time: slot.start_time,
        end_time: slot.end_time,
        available: !occupiedTimes.has(slot.start_time),
      }));

      setAvailableSlots(available);
    }
    setLoading(false);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 90);
    return maxDate.toISOString().split('T')[0];
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-semibold text-slate-900">Seleccionar Profesional y Fecha</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Profesional
            </label>
            <select
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            >
              <option value="">Selecciona un profesional</option>
              {professionals.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.full_name} {prof.specialty ? `- ${prof.specialty}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de consulta
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAppointmentType('presencial')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                  appointmentType === 'presencial'
                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <MapPin className="w-5 h-5" />
                Presencial
              </button>
              <button
                type="button"
                onClick={() => setAppointmentType('virtual')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                  appointmentType === 'virtual'
                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <Video className="w-5 h-5" />
                Virtual
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getMinDate()}
              max={getMaxDate()}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
          </div>
        </CardContent>
      </Card>

      {selectedProfessional && selectedDate && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              <h3 className="text-lg font-semibold text-slate-900">Horarios Disponibles</h3>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-600">Cargando horarios...</div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600">No hay horarios disponibles para esta fecha.</p>
                <p className="text-sm text-slate-500 mt-2">Intenta seleccionar otra fecha.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (slot.available) {
                        onSelectSlot(
                          selectedProfessional,
                          selectedDate,
                          slot.start_time,
                          slot.end_time,
                          appointmentType
                        );
                      }
                    }}
                    disabled={!slot.available}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      slot.available
                        ? 'bg-teal-50 text-teal-700 border-2 border-teal-200 hover:bg-teal-100 hover:border-teal-300'
                        : 'bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    {formatTime(slot.start_time)}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
