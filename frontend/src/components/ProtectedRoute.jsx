import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner loading text="Loading your account..." />;
    if (!user) return <Navigate to="/login" replace/>;
    return children
}

export function SuperAdminRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner loading text="Loading your account..." />;
    if (!user) return <Navigate to="/login" replace />;
    if (user.user_type !== 'superadmin') return <Navigate to="/admin" replace />;
    return children;
}