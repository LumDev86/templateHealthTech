import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal, ModalFooter } from '../ui/Modal';

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const DAYS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export function AvailabilitySettings() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newSlot, setNewSlot] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '10:00',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSlots();
    }
  }, [user]);

  const fetchSlots = async () => {
    const { data, error } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('professional_id', user?.id)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (!error && data) {
      setSlots(data);
    }
    setLoading(false);
  };

  const handleAddSlot = async () => {
    const { error } = await supabase.from('availability_slots').insert({
      professional_id: user?.id,
      day_of_week: newSlot.day_of_week,
      start_time: newSlot.start_time,
      end_time: newSlot.end_time,
      is_active: true,
    });

    if (!error) {
      await fetchSlots();
      setShowModal(false);
      setNewSlot({ day_of_week: 1, start_time: '09:00', end_time: '10:00' });
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    const { error } = await supabase
      .from('availability_slots')
      .delete()
      .eq('id', slotId);

    if (!error) {
      await fetchSlots();
    }
  };

  const handleToggleSlot = async (slotId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('availability_slots')
      .update({ is_active: !isActive })
      .eq('id', slotId);

    if (!error) {
      await fetchSlots();
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.day_of_week]) {
      acc[slot.day_of_week] = [];
    }
    acc[slot.day_of_week].push(slot);
    return acc;
  }, {} as Record<number, AvailabilitySlot[]>);

  if (loading) {
    return <div className="text-center py-8">Cargando disponibilidad...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Gestión de Disponibilidad</h3>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Añadir Horario
        </Button>
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6, 0].map((dayIndex) => (
          <Card key={dayIndex}>
            <CardHeader>
              <h4 className="font-medium text-slate-900">{DAYS[dayIndex]}</h4>
            </CardHeader>
            <CardContent>
              {groupedSlots[dayIndex]?.length > 0 ? (
                <div className="space-y-2">
                  {groupedSlots[dayIndex].map((slot) => (
                    <div
                      key={slot.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        slot.is_active
                          ? 'bg-teal-50 border-teal-200'
                          : 'bg-slate-50 border-slate-200 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-slate-600" />
                        <span className="font-medium text-slate-900">
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </span>
                        {!slot.is_active && (
                          <span className="text-xs text-slate-500">(Desactivado)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleSlot(slot.id, slot.is_active)}
                        >
                          {slot.is_active ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSlot(slot.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Sin horarios configurados</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Añadir Horario">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Día de la semana
            </label>
            <select
              value={newSlot.day_of_week}
              onChange={(e) =>
                setNewSlot({ ...newSlot, day_of_week: Number(e.target.value) })
              }
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {DAYS.map((day, index) => (
                <option key={index} value={index}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Hora de inicio
            </label>
            <input
              type="time"
              value={newSlot.start_time}
              onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Hora de fin
            </label>
            <input
              type="time"
              value={newSlot.end_time}
              onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleAddSlot}>
            Añadir
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
