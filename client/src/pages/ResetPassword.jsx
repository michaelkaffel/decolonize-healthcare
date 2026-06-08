import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json()

            if (!res.ok) {
                setError(data.message || 'Something went wrong. Please try again.');
                return;
            }

            setSuccess(true);
        } catch(err) {
            console.error('Error:', err);
            setError('Unable to reach server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // No token in URL
    if (!token) {
        return (
            <div className='flex min-h-screen items-center justify-center bg-brand-cream2 p-6'>
                <div className='w-full max-w-sm text-center'>
                    <img src='/logo.svg' alt='Decolonize Healthcare' className='mx-auto mb-6 h-10' />
                    <p className='text-sm text-gray-500'>
                        This reset link is invalid.{' '}
                        <Link to='/forgot-password' className='font-medium text-brand-coral hover:underline' >
                            Request a new one
                        </Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className='flex min-h-screen items-center justify-center bg-brand-cream2 p-6'>
            <SEO 
                title='Reset Password'
                path='/reset-password'
                description='Set a new password for your Decolonize Healthcare account.'
            />
            <div className='w-full max-w-sm'>
                <div className='mb-8'>
                    <img src='/logo.svg' alt='Decolonize Healthcare' className='mb-6 h-10' />
                    <h1 className='text-2xl font-semibold text-gray-900'>Set a new password</h1>
                    <p className='mt-1 text-sm text-gray-500'>Must be at least 8 characters.</p>
                </div>

                {/* Success - form replaced */}
                {success ? (
                    <div className='rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700'>
                        Password updated successfully.{' '}
                        <Link to='/login' className='font-medium underline'>
                            Sign in
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        {error && (
                            <p className='rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600'>{error}</p>
                        )}
                        <div>
                            <label className='mb-1 block text-sm font-medium text-gray-700' htmlFor='password'>
                                New password
                            </label>
                            <input 
                                id='password'
                                type='password'
                                autoComplete='new-password'
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className='w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-coral'
                            />
                        </div>
                        <div>
                            <label className='mb-1 block text-sm font-medium text-gray-700' htmlFor='confirm'>
                                Confirm password
                            </label>
                            <input 
                                id='confirm'
                                type='password'
                                autoComplete='new-password'
                                required
                                minLength={8}
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                className='w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-coral'
                            />
                        </div>
                        <button
                            type='submit'
                            disabled={loading}
                            className='w-full rounded-full bg-brand-crimson py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-coral disabled:opacity-60'
                        >
                            {loading ? 'Updating...' : 'Update password'}
                        </button>
                    </form>
                )}

                <p className='mt-6 text-center text-sm text-gray-500'>
                    <Link to='/login' className='font-medium text-brand-coral hover:underline'>
                        Back to sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;