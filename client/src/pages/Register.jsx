import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.status === 500) {
                setError('Something went wrong on our end. Please try again.');
                return
            }
            if (res.status !== 201) {
                setError(data.message || 'Unable to create account. Please try again.');
                return;
            }
            dispatch(setUser(data));
            navigate('/dashboard');
        } catch {
            setError('Unable to reach the server. Please try again.')
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex flex-col lg:flex-row min-h-screen'>
            <div className='lg:w-1/2 items-center justify-center bg-brand-blush p-12'>
                <img
                    src='/illustrations/register.svg'
                    alt='Person creating an account'
                    className='w-full max-w-md mx-auto lg:mt-24'
                />
            </div>

            <div className='flex flex-1 items-center justify-center bg-brand-cream p-6'>
                <div className='w-full max-w-sm'>
                    <div className='mb-8 flex justify-between items-center '>
                        <div>
                            <h1 className='text-2xl font-semibold text-gray-900'>Create your account</h1>
                            <p className='mt-1 text-sm text-gray-500'>Start learning today. Free to register.</p>
                        </div>

                        <img src='/logo.svg' alt='Decolonize Healthcare' className='ms-auto h-10' />

                    </div>

                    <a
                        href='/api/auth/google'
                        className='mb-4 flex w-full items-center justify-center gap-3 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
                    >
                        <GoogleIcon />
                        Continue with Google
                    </a>

                    <div className='mb-4 flex items-center gap-3'>
                        <hr className='flex-1 border-gray-200' />
                        <span className='text-xs text-gray-400'>or</span>
                        <hr className='flex-1 border-gray-200' />
                    </div>

                    <form onSubmit={handleSubmit} className='space-y-4'>
                        {error && (
                            <p className='rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600'>{error}</p>
                        )}
                        <div>
                            <label className='mb-1 block text-sm font-medium text-gray-700' htmlFor='name'>
                                Full name
                            </label>
                            <input
                                id='name'
                                type='text'
                                name='name'
                                autoComplete='name'
                                required
                                value={form.name}
                                onChange={handleChange}
                                className='w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-coral'
                            />
                        </div>
                        <div>
                            <label className='mb-1 block text-sm font-medium text-gray-700' htmlFor='email'>
                                Email
                            </label>
                            <input
                                id='email'
                                type='email'
                                name='email'
                                autoComplete='email'
                                required
                                value={form.email}
                                onChange={handleChange}
                                className='w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-coral'
                            />
                        </div>
                        <div>
                            <label className='mb-1 block text-sm font-medium text-gray-700' htmlFor='password'>
                                Password
                            </label>
                            <input
                                id='password'
                                type='password'
                                name='password'
                                autoComplete='new-password'
                                required
                                minLength={8}
                                value={form.password}
                                onChange={handleChange}
                                className='w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-coral'
                            />
                            <p className='mt-1 pl-4 text-xs text-gray-400'>At least 8 characters</p>
                        </div>
                        <button
                            type='submit'
                            disabled={loading}
                            className='w-full rounded-full bg-brand-crimson py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-coral disabled:opacity-60'
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    <p className='mt-6 text-center text-sm text-gray-500'>
                        Already have an account?{' '}
                        <Link to='/login' className='font-medium text-brand-coral hover:underline'>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

const GoogleIcon = () => (
    <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
            d='M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z'
            fill='#4285F4'
        />
        <path
            d='M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z'
            fill='#34A853'
        />
        <path
            d='M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z'
            fill='#FBBC05'
        />
        <path
            d='M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z'
            fill='#EA4335'
        />
    </svg>
);

export default Register;
