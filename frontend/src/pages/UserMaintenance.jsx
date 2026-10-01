import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminLayout from '../components/AdminLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../context/NotificationContext';

const inputClass = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";

export default function UserMaintenance() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [formUser, setFormUser] = useState(null);
    const [errors, setErrors] = useState({});
    const [userError, setUserError] = useState('');
    const [loading, setLoading] = useState(false);
    const { showSuccess } = useNotification();

    const load = async () => {
        const res = await api.get('/api/users');
        setUsers(res.data.data);
    };
    useEffect(() => { load(); }, []);

    const query = search.toLowerCase();
    const filtered = users.filter(u =>
        [u.first_name, u.last_name, u.user_name, u.email]
            .some(value => String(value ?? '').toLowerCase().includes(query))
    );

    const deleteUser = async (id) => {
        setUserError('');
        if (!confirm('Delete this user? All their sites and equipment will be deleted too.')) return;
        setLoading(true);
        try {
            await api.delete(`/api/users/${id}`);
            await load();
            showSuccess('User deleted successfully.');
        } catch {
            setUserError('Deleting user failed. Please try again.');
        } finally {
            setLoading(false);
        }

    };

    const saveUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            const name = [formUser.first_name, formUser.last_name].filter(Boolean).join(' ');
            await api.put(`/api/users/${formUser.id}`, formUser);
            setFormUser(null);
            await load();
            showSuccess(`${name || 'User'} updated successfully.`);
        } catch (err) {
            if (err.response?.status === 422) setErrors(err.response.data.errors);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout title="Users">
            <LoadingSpinner loading={loading} text="Processing..." />
            <input
                placeholder="Filter by name, username, or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`${inputClass} mb-4 max-w-sm`}
            />

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                {userError && (
                    <p role="alert" className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {userError}
                    </p>
                )}
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Username</th>
                            <th className="px-4 py-3 font-medium">Email</th>
                            <th className="px-4 py-3 font-medium">Role</th>
                            <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 text-slate-800">{[u.first_name, u.last_name].filter(Boolean).join(' ')}</td>
                                <td className="px-4 py-3 font-mono text-xs text-slate-500">{u.user_name}</td>
                                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                                <td className="px-4 py-3 capitalize text-slate-600">{u.user_type}</td>
                                <td className="px-4 py-3 space-x-3">
                                    <button onClick={() => setFormUser(u)} className="text-sm font-medium text-slate-600 hover:underline">
                                        Edit
                                    </button>
                                    <button onClick={() => deleteUser(u.id)} className="text-sm font-medium text-rose-600 hover:underline">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No users found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {formUser && (
                <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 px-4">
                    <form onSubmit={saveUser} className="w-full max-w-sm rounded-lg bg-white p-6">
                        <h3 className="mb-4 text-base font-semibold text-slate-900">Edit User</h3>

                        <label className="mb-1 block text-sm font-medium text-slate-700">First name</label>
                        <input
                            value={formUser.first_name ?? ''}
                            onChange={e => setFormUser({ ...formUser, first_name: e.target.value })}
                            className={`${inputClass} mb-1`}
                        />
                        {errors.first_name && <p className="mb-3 text-xs text-rose-600">{errors.first_name[0]}</p>}

                        <label className="mb-1 mt-3 block text-sm font-medium text-slate-700">Last name</label>
                        <input
                            value={formUser.last_name ?? ''}
                            onChange={e => setFormUser({ ...formUser, last_name: e.target.value })}
                            className={`${inputClass} mb-1`}
                        />
                        {errors.last_name && <p className="mb-3 text-xs text-rose-600">{errors.last_name[0]}</p>}

                        <label className="mb-1 mt-3 block text-sm font-medium text-slate-700">Email</label>
                        <input
                            value={formUser.email}
                            onChange={e => setFormUser({ ...formUser, email: e.target.value })}
                            className={`${inputClass} mb-1`}
                        />
                        {errors.email && <p className="mb-3 text-xs text-rose-600">{errors.email[0]}</p>}

                        <label className="mb-1 mt-3 block text-sm font-medium text-slate-700">Role</label>
                        <select
                            value={formUser.user_type}
                            onChange={e => setFormUser({ ...formUser, user_type: e.target.value })}
                            className={`${inputClass} mb-4`}
                        >
                            <option value="admin">Admin</option>
                            <option value="superadmin">SuperAdmin</option>
                        </select>

                        <div className="flex gap-2">
                            <button type="submit" className="flex-1 rounded-md bg-teal-600 py-2 text-sm font-medium text-white hover:bg-teal-700">
                                Save
                            </button>
                            <button type="button" onClick={() => setFormUser(null)} className="flex-1 rounded-md border border-slate-300 py-2 text-sm text-slate-600 hover:bg-slate-50">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </AdminLayout>
    );
}