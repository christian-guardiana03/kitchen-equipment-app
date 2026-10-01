import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminLayout from '../components/AdminLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../context/NotificationContext';

const inputClass = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";

export default function EquipmentMaintenance() {
  const [equipment, setEquipment] = useState([]);
  const [search, setSearch] = useState('');
  const [formEq, setFormEq] = useState(null); // { id?, serial_number, description, condition }
  const [errors, setErrors] = useState({});
  const [equipmentError, setEquipmentError] = useState('');
  const [loading, setLoading] = useState(false);
  const { showSuccess } = useNotification();

  const load = async () => {
    const res = await api.get('/api/equipment');
    setEquipment(res.data.data);
  };
  useEffect(() => { load(); }, []);

  const filtered = equipment.filter(eq =>
    eq.description.toLowerCase().includes(search.toLowerCase()) ||
    eq.serial_number.toLowerCase().includes(search.toLowerCase())
  );

  const deleteEquipment = async (id) => {
    setEquipmentError('');
    if (!confirm('Delete this equipment?')) return;

    setLoading(true);
    try {
      await api.delete(`/api/equipment/${id}`);
      await load();
      showSuccess('Equipment deleted successfully.');
    } catch (error) {
      setEquipmentError('Deleting the equipment failed. Please try again.');
    } finally {
      setLoading(false);
    }

  };

  const saveEquipment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const isEditing = Boolean(formEq.id);
      if (isEditing) {
        await api.put(`/api/equipment/${formEq.id}`, formEq);
      } else {
        await api.post('/api/equipment', formEq);
      }
      setFormEq(null);
      await load();
      showSuccess(`Equipment ${isEditing ? 'updated' : 'created'} successfully.`);
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Equipments">
      <LoadingSpinner loading={loading} text="Processing..." />
      <div className="mb-4 flex items-center justify-between">
        <input
          placeholder="Filter by description or serial..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`${inputClass} max-w-xs`}
        />
        <button
          onClick={() => setFormEq({ serial_number: '', description: '', condition: 'working' })}
          className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          New Equipment
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {equipmentError && (
          <p role="alert" className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {equipmentError}
          </p>
        )}
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Serial Number</th>
              <th className="px-4 py-3 font-medium">Condition</th>
              <th className="px-4 py-3 font-medium">Site</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(eq => (
              <tr key={eq.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-800">{eq.description}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{eq.serial_number}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${eq.condition === 'working' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                    {eq.condition === 'working' ? 'Working' : 'Not working'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {eq.registered_equipment?.site?.description ?? '—'}
                </td>
                <td className="px-4 py-3 space-x-3">
                  <button onClick={() => setFormEq(eq)} className="text-sm font-medium text-slate-600 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => deleteEquipment(eq.id)} className="text-sm font-medium text-rose-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No equipment found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {formEq && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 px-4">
          <form onSubmit={saveEquipment} className="w-full max-w-sm rounded-lg bg-white p-6">
            <h3 className="mb-4 text-base font-semibold text-slate-900">
              {formEq.id ? 'Edit Equipment' : 'New Equipment'}
            </h3>

            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <input
              value={formEq.description}
              onChange={e => setFormEq({ ...formEq, description: e.target.value })}
              className={`${inputClass} mb-1`}
            />
            {errors.description && <p className="mb-3 text-xs text-rose-600">{errors.description[0]}</p>}

            <label className="mb-1 mt-3 block text-sm font-medium text-slate-700">Serial number</label>
            <input
              value={formEq.serial_number}
              onChange={e => setFormEq({ ...formEq, serial_number: e.target.value })}
              className={`${inputClass} mb-1 font-mono`}
            />
            {errors.serial_number && <p className="mb-3 text-xs text-rose-600">{errors.serial_number[0]}</p>}

            <label className="mb-1 mt-3 block text-sm font-medium text-slate-700">Condition</label>
            <select
              value={formEq.condition}
              onChange={e => setFormEq({ ...formEq, condition: e.target.value })}
              className={`${inputClass} mb-4`}
            >
              <option value="working">Working</option>
              <option value="not_working">Not working</option>
            </select>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 rounded-md bg-teal-600 py-2 text-sm font-medium text-white hover:bg-teal-700">
                Save
              </button>
              <button type="button" onClick={() => setFormEq(null)} className="flex-1 rounded-md border border-slate-300 py-2 text-sm text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}