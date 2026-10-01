import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../context/NotificationContext';

export default function Login() {
    const [user_name, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showSuccess } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await login(user_name, password);
            showSuccess('You are now logged in.');
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <LoadingSpinner loading={loading} text="Logging in..." />
            <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
                <p className="text-xs text-slate-400 text-center">Kitchen Equipment</p>
                <h1 className="mb-6 text-xl font-semibold text-slate-900 text-center">Log in</h1>
                 {error && (
                    <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
                 )}

                 <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
                 <input 
                    value={user_name}
                    onChange={e => setUserName(e.target.value)}
                    className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />

                <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                 <input 
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />

                <button type="submit" disabled={loading} className="mb-4 w-full rounded-md bg-teal-600 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60">
                    Login
                </button>

                <p className="text-center text-sm text-slate-500">
                    No account? <Link to="/signup" className="font-medium text-teal-600 hover:underline">Sign up</Link>
                </p>
            </form>
        </div>
    );
}