import React, { useState, useEffect } from 'react';
import { Reservation, ReservationSlot, ReservationStatus, AdditionalServices } from '../../types';
import { format } from 'date-fns';

interface ReservationEditModalProps {
  reservation: Reservation;
  onSave: (updatedReservation: Reservation) => void;
  onClose: () => void;
}

const ReservationEditModal: React.FC<ReservationEditModalProps> = ({ reservation, onSave, onClose }) => {
  const [formData, setFormData] = useState<Reservation>(reservation);

  useEffect(() => {
    setFormData(reservation);
  }, [reservation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [name]: checked
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-white">
        <h2 className="text-2xl font-serif text-amber-300 mb-4">Editar Reserva</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400">Fecha:</label>
            <input
              type="text"
              value={format(new Date(formData.date), 'dd/MM/yyyy')}
              readOnly
              className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400">Franja Horaria:</label>
            <select
              name="slot"
              value={formData.slot}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            >
              {Object.values(ReservationSlot).map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400">Nombre Cliente:</label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400">Teléfono:</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400">Invitados:</label>
            <input
              type="number"
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              min="1"
              className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400">Propósito:</label>
            <input
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400">Comentarios:</label>
            <textarea
              name="comments"
              value={formData.comments || ''}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400">Costo del Evento:</label>
            <input
              type="number"
              name="eventCost"
              value={formData.eventCost}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400">Depósito:</label>
            <input
              type="number"
              name="deposit"
              value={formData.deposit}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400">Estado:</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            >
              {Object.values(ReservationStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-medium text-zinc-300 mb-2">Servicios Adicionales:</h3>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(formData.services) as Array<keyof AdditionalServices>).map(serviceKey => (
                <div key={serviceKey} className="flex items-center">
                  <input
                    type="checkbox"
                    name={serviceKey}
                    checked={formData.services[serviceKey]}
                    onChange={handleServiceChange}
                    id={`service-${serviceKey}`}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-zinc-600 rounded"
                  />
                  <label htmlFor={`service-${serviceKey}`} className="ml-2 block text-sm text-zinc-300">
                    {serviceKey.charAt(0).toUpperCase() + serviceKey.slice(1).replace(/([A-Z])/g, ' $1')}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-600 rounded-md shadow-sm text-sm font-medium text-zinc-300 bg-zinc-700 hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationEditModal;
