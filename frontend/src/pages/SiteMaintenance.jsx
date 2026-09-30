import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminLayout from '../components/AdminLayout';

const inputClass = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";

export default function SiteMaintenance() {
    const [sites, setSites] = useState([]);
    const [search, setSearch] = useState('');
    const [editingSite, setEditingSite] = useState(null);
    const [availableEquipment, setAvailableEquipment] = useState([]);
    const [assignedEquipment, setAssignedEquipment] = useState([]);
    const [formSite, setFormSite] = useState(null); // { id?, description, active }
    const [errors, setErrors] = useState({});
    const [siteError, setSiteError] = useState('');
    const [equipmentError, setEquipmentError] = useState('');
    const [equipmentLoading, setEquipmentLoading] = useState(false);

    const loadSites = async () => {
        try {
            const response = await api.get('/api/sites');
            setSites(response.data.data);
            setSiteError('');
        } catch {
            setSiteError('Could not load sites. Please try again.');
        }
    };
    useEffect(() => { loadSites(); }, []);

    const filtered = sites.filter(s =>
        s.description.toLowerCase().includes(search.toLowerCase())
    );

    const openEquipmentEditor = async (site) => {
        if (editingSite?.id !== site.id) {
            setAvailableEquipment([]);
            setAssignedEquipment([]);
        }
        setEditingSite(site);
        setEquipmentError('');
        setEquipmentLoading(true);

        try {
            const [availableRes, siteRes] = await Promise.all([
                api.get(`/api/sites/${site.id}/available-equipment`),
                api.get(`/api/sites/${site.id}`),
            ]);
            setAvailableEquipment(availableRes.data.data);
            setAssignedEquipment(siteRes.data.data.equipment ?? []);
        } catch {
            setEquipmentError('Could not load equipment. Please try again.');
        } finally {
            setEquipmentLoading(false);
        }
    };

    const detachEquipment = async (registeredEquipmentId) => {
        setEquipmentError('');
        try {
            await api.delete(`/api/sites/${editingSite.id}/equipment/${registeredEquipmentId}`);
            await openEquipmentEditor(editingSite);
            await loadSites();
        } catch {
            setEquipmentError('Could not remove equipment. Please try again.');
        }
    };

    const attachEquipment = async (equipmentId) => {
        setEquipmentError('');
        try {
            await api.post(`/api/sites/${editingSite.id}/equipment`, { equipment_id: equipmentId });
            await openEquipmentEditor(editingSite);
            await loadSites();
        } catch {
            setEquipmentError('Could not add equipment. Please try again.');
        }
    };

    const deleteSite = async (id) => {
        if (!confirm('Delete this site? Its equipment will be unlinked, not deleted.')) return;
        setSiteError('');
        try {
            await api.delete(`/api/sites/${id}`);
            await loadSites();
        } catch {
            setSiteError('Could not delete this site. Please try again.');
        }
    };

    const saveSite = async (e) => {
        e.preventDefault();
        setErrors({});
        try {
            if (formSite.id) {
                await api.put(`/api/sites/${formSite.id}`, formSite);
            } else {
                await api.post('/api/sites', formSite);
            }
            setFormSite(null);
            loadSites();
        } catch (err) {
            if (err.response?.status === 422) setErrors(err.response.data.errors);
        }
    };

    return (
        <AdminLayout title="Sites">
            <div className="mb-4 flex items-center justify-between">
                <input
                    placeholder="Filter by description..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={`${inputClass} max-w-xs`}
                />
                <button
                    onClick={() => setFormSite({ description: '', active: true })}
                    className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                >
                    New Site
                </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                {siteError && (
                    <p role="alert" className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {siteError}
                    </p>
                )}
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">Description</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Equipment</th>
                            <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map(site => (
                            <tr key={site.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 text-slate-800">{site.description}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${site.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {site.active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-mono text-slate-600">{site.equipment_count}</td>
                                <td className="px-4 py-3 space-x-3">
                                    <button onClick={() => setFormSite(site)} className="text-sm font-medium text-slate-600 hover:underline">
                                        Edit
                                    </button>
                                    <button onClick={() => openEquipmentEditor(site)} className="text-sm font-medium text-teal-600 hover:underline">
                                        Edit equipment
                                    </button>
                                    <button onClick={() => deleteSite(site.id)} className="text-sm font-medium text-rose-600 hover:underline">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No sites found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create / Edit Site modal */}
            {formSite && (
                <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 px-4">
                    <form onSubmit={saveSite} className="w-full max-w-sm rounded-lg bg-white p-6">
                        <h3 className="mb-4 text-base font-semibold text-slate-900">
                            {formSite.id ? 'Edit Site' : 'New Site'}
                        </h3>

                        <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                        <input
                            value={formSite.description}
                            onChange={e => setFormSite({ ...formSite, description: e.target.value })}
                            className={`${inputClass} mb-1`}
                        />
                        {errors.description && <p className="mb-3 text-xs text-rose-600">{errors.description[0]}</p>}

                        <label className="mb-4 mt-3 flex items-center gap-2 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={formSite.active}
                                onChange={e => setFormSite({ ...formSite, active: e.target.checked })}
                            />
                            Active
                        </label>

                        <div className="flex gap-2">
                            <button type="submit" className="flex-1 rounded-md bg-teal-600 py-2 text-sm font-medium text-white hover:bg-teal-700">
                                Save
                            </button>
                            <button type="button" onClick={() => setFormSite(null)} className="flex-1 rounded-md border border-slate-300 py-2 text-sm text-slate-600 hover:bg-slate-50">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Site Equipment modal (unchanged from before) */}
            {editingSite && (
                <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 px-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6">
                        <h3 className="mb-4 text-base font-semibold text-slate-900">
                            Edit equipment — {editingSite.description}
                        </h3>
                        {equipmentError && (
                            <p role="alert" className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                {equipmentError}
                            </p>
                        )}
                        {equipmentLoading && (
                            <p role="status" className="mb-3 text-sm text-slate-500">Loading equipment...</p>
                        )}
                        <p className="mb-2 text-sm text-slate-500">Unassigned equipment you own</p>
                        <ul className="mb-4 divide-y divide-slate-100 rounded-md border border-slate-200">
                            {availableEquipment.map(eq => (
                                <li key={eq.id} className="flex items-center justify-between px-3 py-2 text-sm">
                                    <span>
                                        {eq.description}{' '}
                                        <span className="font-mono text-xs text-slate-400">{eq.serial_number}</span>
                                    </span>
                                    <button onClick={() => attachEquipment(eq.id)} className="text-teal-600 hover:underline">
                                        Add
                                    </button>
                                </li>
                            ))}
                            {availableEquipment.length === 0 && (
                                <li className="px-3 py-2 text-sm text-slate-400">No unassigned equipment.</li>
                            )}
                        </ul>
                        <p className="mb-2 text-sm text-slate-500">Currently Assigned</p>
                        <ul className="mb-4 divide-y divide-slate-100 rounded-md border border-slate-200">
                            {assignedEquipment.map(eq => (
                                <li key={eq.id} className="flex items-center justify-between px-3 py-2 text-sm">
                                    <span>
                                        {eq.description}{' '}
                                        <span className="font-mono text-xs text-slate-400">{eq.serial_number}</span>
                                    </span>
                                    <button onClick={() => detachEquipment(eq.registered_equipment.id)} className="text-teal-600 hover:underline">
                                        Remove
                                    </button>
                                </li>
                            ))}
                            {assignedEquipment.length === 0 && (
                                <li className="px-3 py-2 text-sm text-slate-400">No unassigned equipment.</li>
                            )}
                        </ul>
                        <button onClick={() => setEditingSite(null)} className="w-full rounded-md border border-slate-300 py-2 text-sm text-slate-600 hover:bg-slate-50">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}