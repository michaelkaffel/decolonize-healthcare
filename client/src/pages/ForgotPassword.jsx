import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | success | google | error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (res.status === 500) {
                setStatus('error');
                setMessage('Something went wrong on our end. Please try again.');
                return;
            }

            // Google only account
            if (data.message.includes('Google Sign-In')) {
                setStatus('google');
                setMessage(data.message);
                return;
            }

            setStatus('success');
            setMessage(data.message);
        } catch {
            setStatus('error');
            setMessage('Unable to reach the server. Please try again.');
        }
    };

    return (
        <div className='flex min-h-screen items-center justify-center bg-brand-cream2 p-6'>
            <SEO
                title='Forgot Password'
                path='/forgot-password'
                description='Reset your Decolonize Healthcare account password.'
            />
            <div className='w-full max-w-sm'>
                <div className='mb-8'>
                    <img src='/logo.svg' alt='Decolonize Healthcare' className='mb-6 h-10' />
                    <h1 className='text-2xl font-semibold text-gray-900'>Forgot your password?</h1>
                    <p className='mt-1 text-sm text-gray-500'>
                        Enter your email and we'll send you a reset link.
                    </p>
                </div>

                {/* Generic success */}
                {status === 'success' && (
                    <div className='rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700'>
                        {message}
                    </div>
                )}

                {/* Google only account */}
                {status === 'google' && (
                    <div className='rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700'>
                        {message}{' '}
                        <Link to='/login' className='font-medium underline'>
                            Back to sign in
                        </Link>
                    </div>
                )}

                {/* Form - hidden after success or google */}
                {status !== 'success' && status !== 'google' && (
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        {status === 'error' && (
                            <p className='rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600'>
                                {message}
                            </p>
                        )}
                        <div>
                            <label className='mb-1 block text-sm font-medium text-gray-700' htmlFor='email'>
                                Email
                            </label>
                            <input
                                id='email'
                                type='email'
                                autoComplete='email'
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className='w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-coral'
                            />
                        </div>
                        <button
                            type='submit'
                            disabled={status === 'loading'}
                            className='w-full rounded-full bg-brand-crimson py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-coral disabled:opacity-60'
                        >
                            {status === 'loading' ? 'Sending...' : 'Send reset link'}
                        </button>
                    </form>
                )}

                <p className='mt-6 text-center text-sm text-gray-500'>
                    Remember it?{' '}
                    <Link to='/login' className='font-medium text-brand-coral hover:underline' >
                        Back to sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;