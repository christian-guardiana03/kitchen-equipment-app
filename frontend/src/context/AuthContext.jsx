import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import { getCsrfCookie } from '../api/csrf';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { pathname } = useLocation();

    useEffect(() => {
        if (pathname === '/login' || pathname === '/signup' || user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        api.get('/api/me')
            .then(res => setUser(res.data.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, [pathname, user]);

    const login = async (user_name, password) => {
        await getCsrfCookie();
        await api.post('/api/login', { user_name, password });
        const res = await api.get('/api/me');
        setUser(res.data.data);
    }

    const register = async (payload) => {
        await getCsrfCookie();
        await api.post('/api/register', payload);
        const res = await api.get('/api/me');
        setUser(res.data.data);
    }

    const logout = async () => {
        await api.post('/api/logout');
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);