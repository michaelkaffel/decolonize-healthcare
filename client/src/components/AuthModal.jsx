import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../store/userSlice';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const AuthModal = ({ initialMode = 'login', onClose }) => {
    const [mode, setMode] = useState(initialMode);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isLogin = mode === 'login';

    const switchMode = (next) => {
        setMode(next);
        setShowEmailForm(false);
        setError('');
        setName('');
        setEmail('');
        setPassword('');
    };

    const handleGoogleAuth = () => {
        window.location.href = '/api/auth/google';
    };

    const handleSubmit = async () => {
        if (!email || !password || (!isLogin && !name)) {
            setError('Please fill in all fields.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const url = isLogin ? '/api/auth/login' : '/api/auth/register';
            const body = isLogin ? { email, password } : { name, email, password };

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (isLogin) {
                if (!data.id) {
                    setError(data.message || 'Invalid email or password.');
                    return;
                }
                dispatch(setUser(data));
                onClose();
                navigate('/dashboard');
            } else {
                if (res.status !== 201) {
                    setError(data.message || 'Registration failed. Please try again.');
                    return;
                }
                dispatch(setUser(data));
                onClose();
                navigate('/dashboard');
            }
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='fixed inset-0 z-50 bg-white flex flex-col overflow-y-auto'>

            <button
                onClick={onClose}
                className='absolute top-5 right-6 text-[#7B1818] hover:opacity-60 transition-opacity'
                aria-label='close'
            >
                <CloseIcon />
            </button>

            <div className='flex-1 flex flex-col items-center justify-center px-6 py-16'>
                <h1 className='text-4xl font-bold text-[#7B1818] mb-3'>
                    {isLogin ? 'Log In' : 'Sign Up'}
                </h1>

                <p className='text-sm mb-8' style={{ color: '#555' }}>
                    {isLogin ? (
                        <>
                            New to this site?{' '}
                            <button
                                onClick={() => switchMode('register')}
                                className='text-[#C94040] underline underline-offset-2'
                            >
                                Sign Up
                            </button>
                        </>
                    ) : (
                        <>
                            Already a member?{' '}
                            <button
                                onClick={() => switchMode('login')}
                                className='text-[#C94040] underline underline-offset-2'
                            >
                                Log In
                            </button>
                        </>
                    )}
                </p>

                <div className='w-full max-w-xs space-y-3'>
                    <button
                        onClick={handleGoogleAuth}
                        className='w-full flex items-center justify-center gap-3 border border-gray-300 rounded px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                    >
                        <GoogleIcon />
                        {isLogin ? 'Log in with Google' : 'Sign up with Google'}
                    </button>

                    <div className='flex items-center gap-3'>
                        <hr className='flex-1 border-[#C94040] opacity-30'/>
                        <span className='text-[#C94040] text-sm'>or</span>
                        <hr className='flex-1 border-[#C94040] opacity-30'/>
                    </div>

                    {!showEmailForm ? (
                        <button
                            onClick={() => setShowEmailForm(true)}
                            className='w-full border border-[#C94040] rounded px-4 py-4 text-sm text-[#C94040] hover:bg-[#F9EDED] transition-colors'
                        >
                            {isLogin ? 'Log in with email' : 'Sign up with email'}
                        </button>
                    ) : (
                        <div className='space-y-3 pt-1'>
                            {!isLogin && (
                                <input 
                                    type='text'
                                    placeholder='Full name'
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className='w-full border border-gray-300 rounded-full px-5 py-3 text-sm outline-none focus:border-[#C94040] transition-colors'
                                />
                            )}
                            <input 
                                    type='email'
                                    placeholder='Email'
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className='w-full border border-gray-300 rounded-full px-5 py-3 text-sm outline-none focus:border-[#C94040] transition-colors'
                                />
                            <input 
                                    type='password'
                                    placeholder='Password'
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                    className='w-full border border-gray-300 rounded-full px-5 py-3 text-sm outline-none focus:border-[#C94040] transition-colors'
                                />
                                {error && (
                                    <p className='text-red-600 text-sm text-center'>{error}</p>
                                )}
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className='w-full bg-[#C94040] text-white rounded-full px-5 py-3 text-sm font-semibold hover:bg-[#7B1818] transition-colors disabled:opacity-50'
                            >
                                {loading ? 'Please wait...' : isLogin ? 'Log In' : 'Create Account'}
                            </button>
                            <button
                                onClick={() => { setShowEmailForm(false); setError(''); }}
                                className='w-full text-xs text-gray-400 hover:text-gray-600 transition-colors pt-1'
                            >
                                ← Back
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;