import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        user_name: '',
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const { register } = useAuth();
    const navigate = useNavigate();

    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        try {
            await register(form);
            navigate('/admin');
        } catch (err) {
            if (err.response?.status === 422) setErrors(err.response.data.errors);
        }
    }

    const field = (label, key, type = 'text') => (
        <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
            <input
                type={type}
                value={form[key]}
                onChange={update(key)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
            {errors[key] && <p className="mt-1 text-xs text-rose-600">{errors[key][0]}</p>}
        </div>
    );

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
                <p className="text-xs text-slate-400">Kitchen Equipment</p>
                <h1 className="mb-6 text-xl font-semibold text-slate-900">Create account</h1>

                {field('First Name', 'first_name')}
                {field('Last Name', 'last_name')}
                {field('Username', 'user_name')}
                {field('Email', 'email', 'email')}
                {field('Password', 'password', 'password')}

                <button type="submit" className="mb-4 mt-2 w-full rounded-md bg-teal-600 py-2 text-sm font-medium text-white hover:bg-teal-700">
                    Sign up
                </button>

                <p className="text-center text-sm text-slate-500">
                    Already have an account? <Link to="/login" className="font-medium text-teal-600 hover:underline">Log in</Link>
                </p>
            </form>
        </div>
    )
}