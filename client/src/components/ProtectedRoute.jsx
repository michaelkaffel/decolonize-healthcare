import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSession } from '../store/userSlice';

const ProtectedRoute = () => {
    const dispatch = useDispatch();
    const { data: user, status } = useSelector(state => state.user);

    useEffect(() => {
        if (status === 'idle' && user === null) dispatch(fetchSession());
    }, [dispatch, status, user]);

    if (status === 'loading') return null; // add spinner
    if (!user) return <Navigate to='/login' replace />
    return <Outlet />
};

export default ProtectedRoute;