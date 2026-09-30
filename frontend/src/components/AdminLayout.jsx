import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItemClass = (active) =>
    `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${active ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

export default function AdminLayout({ children, title }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();


    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <aside className="flex w-56 flex-col justify-between bg-slate-900 px-3 py-6">
                <div>
                    <div className="mb-8 px-3">
                        <p className="text-sm font-semibold text-white">Kitchen Equipment</p>
                        <p className="text-xs text-slate-400">Admin Console</p>
                    </div>
                    <nav className="space-y-1">
                        {user?.user_type === 'superadmin' && (
                            <Link to="/admin/users" className={navItemClass(pathname === '/admin/users')}>Users</Link>
                        )}
                        <Link to="/admin/sites" className={navItemClass(pathname === '/admin/sites')}>Sites</Link>
                        <Link to="/admin/equipment" className={navItemClass(pathname === '/admin/equipment')}>Equipments</Link>
                    </nav>
                </div>
                <div className="border-t border-slate-800 px-3 pt-4">
                    <p className="truncate text-sm text-white">{user?.name}</p>
                    <p className="mb-3 text-xs capitalize text-slate-500">{user?.user_type}</p>
                    <button
                        onClick={handleLogout}
                        className="w-full rounded-md border border-slate-700 py-1.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            <div className="flex-1">
                <header className="border-b border-slate-200 bg-white px-6 py-4">
                    <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
                </header>
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}