import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
    const { user } = useAuth();
    const isSuperAdmin = user?.user_type === 'superadmin';
    const [counts, setCounts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let isCurrent = true;

        const loadCounts = async () => {
            setLoading(true);
            setLoadError('');

            const requests = [
                api.get('/api/equipment'),
                api.get('/api/sites'),
            ];

            if (isSuperAdmin) {
                requests.push(api.get('/api/users'));
            }

            try {
                const [equipmentResponse, siteResponse, userResponse] = await Promise.all(requests);

                if (!isCurrent) return;

                setCounts({
                    equipment: equipmentResponse.data.data.length,
                    sites: siteResponse.data.data.length,
                    users: userResponse?.data.data.length ?? null,
                });
            } catch {
                if (isCurrent) {
                    setLoadError('Could not load dashboard counts. Please try again.');
                }
            } finally {
                if (isCurrent) setLoading(false);
            }
        };

        loadCounts();

        return () => {
            isCurrent = false;
        };
    }, [isSuperAdmin, retryCount]);

    const cards = [
        ...(isSuperAdmin ? [{ label: 'Users', value: counts?.users, href: '/admin/users' }] : []),
        { label: 'Sites', value: counts?.sites, href: '/admin/sites' },
        { label: 'Equipment', value: counts?.equipment, href: '/admin/equipment' },
    ];

    return (
        <AdminLayout title="Admin">
            <section aria-label="Record counts">
                {loadError && (
                    <div role="alert" className="mb-4 flex items-center justify-between gap-4 border-l-4 border-rose-500 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        <span>{loadError}</span>
                        <button
                            type="button"
                            onClick={() => setRetryCount(count => count + 1)}
                            className="shrink-0 font-medium underline underline-offset-2"
                        >
                            Retry
                        </button>
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {cards.map(card => (
                        <Link
                            key={card.label}
                            to={card.href}
                            className="group border border-slate-200 bg-white p-5 transition-colors hover:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-medium text-slate-600">{card.label}</h2>
                                <span aria-hidden="true" className="text-slate-400 transition-colors group-hover:text-teal-700">&rarr;</span>
                            </div>
                            <p className="mt-3 text-3xl font-semibold tabular-nums text-slate-900" aria-live="polite">
                                {loading && counts === null ? '...' : card.value ?? '—'}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">Created records</p>
                        </Link>
                    ))}
                </div>
            </section>
        </AdminLayout>
    )
}