import { useState } from 'react';

const STATUS = { IDLE: 'idle', LOADING: 'loading', SUCCESS: 'success', ERROR: 'error'};

const NewsletterSignup = ({ className = '' }) => {
    const [fields, setFields] = useState({ email: '', firstName: '', lastName: '' });
    const [status, setStatus] = useState(STATUS.IDLE);
    const [errorMsg, setErrorMsg] = useState('');

    const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(STATUS.LOADING);
        setErrorMsg('');

        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fields),
            });

            if (res.ok) {
                setStatus(STATUS.SUCCESS);
                setFields({ email: '', firstName: '', lastName: '' });
            } else {
                const data = await res.json();
                setErrorMsg(data.message || 'Something went wrong. Please try again.');
                setStatus(STATUS.ERROR);
            }
        } catch {
            setErrorMsg('Something went wrong. Please try again.');
            setStatus(STATUS.ERROR);
        }
    };

    if (status === STATUS.SUCCESS) {
        return (
            <div className={`text-center py-4 ${className}`}>
                <p className='text-lg font-medium text-brand-gold'> You're in!</p>
                <p className='text-sm text-gray-600 mt-1'>Check your inbox for a welcome email.</p>
            </div>
        );
    }

    return (
        <div className={className}>
            <p className='text-sm font-semibold uppercase tracking-widest text-brand-crimson mb-3'>
                Join our Newsletter
            </p>
            <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-3'>
                <input 
                    type='text'
                    value={fields.firstName}
                    onChange={set('firstName')}
                    placeholder='First name'
                    disabled={status === STATUS.LOADING}
                    className='flex-1 px-4 py-3 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold disabled:opacity-50'
                />
                <input 
                    type='text'
                    value={fields.lastName}
                    onChange={set('lastName')}
                    placeholder='Last name'
                    disabled={status === STATUS.LOADING}
                    className='flex-1 px-4 py-3 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold disabled:opacity-50'
                />
                <input 
                    type='email'
                    value={fields.email}
                    onChange={set('email')}
                    placeholder='Email address'
                    disabled={status === STATUS.LOADING}
                    className='flex-1 px-4 py-3 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold disabled:opacity-50'
                />
                <button
                    type='submit'
                    disabled={status === STATUS.LOADING}
                    className='px-6 py-3 bg-brand-gold text-white text-sm font-semibold rounded hover:bg-brand-gold/90 transition disabled:opacity-50 whitespace-nowrap'
                >
                    {status === STATUS.LOADING ? 'Subscribing...' : 'Subscribe' }
                </button>
            </form>
            {status === STATUS.ERROR && (
                <p className='text-sm text-red-600 mt-2'>{errorMsg}</p>
            )}
        </div>
    );
};

export default NewsletterSignup;