import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/userSlice'
import { isAction } from '@reduxjs/toolkit';

const educationSubpages = [
    { to: '/education/childhood-adversity', label: 'Childhood Adversity' },
    { to: '/education/anatomy-physiology', label: 'Anatomy & Physiology' },
    { to: '/education/neurobiology', label: 'Neurobiology' },
    { to: '/education/mental-health', label: 'Mental Health' },
    { to: '/education/movement', label: 'Movement' },
    { to: '/education/how-to-understand-a-scientific-article', label: 'How to Understand a Scientific Article' },
    { to: '/education/behavioral-biology', label: 'Behavioral Biology' },
]

const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/articles', label: 'Articles' },
    { to: '/programs', label: 'Programs' },
    { to: '/education', label: 'Education' },
    { to: '/about', label: 'About' },
    { to: '/books', label: 'Books' },
    { to: '/partners', label: 'Partners' },
];

const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md font-medium transition-colors ${isActive
        ? 'bg-brand-blush text-brand-crimson'
        : 'text-gray-600 hover:bg-brand-blush hover:text-brand-crimson'
    }`;

const Navbar = () => {
    const user = useSelector(state => state.user.data);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [eduOpen, setEduOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        setMenuOpen(false);
        setEduOpen(false);
    }, [location.pathname])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const closeMenu = () => { setMenuOpen(false); setEduOpen(false) }

    const handleLogout = async () => {
        closeMenu();
        await dispatch(logout());
        navigate('/');
    };

    return (
        <header className={`sticky top-0 z-50 bg-brand-cream transition-shadow duration-200 ${scrolled ? 'shadow-lg' : 'shadow-none'}`} >
            <div className='mx-auto flex max-w-7xl items-center justify-between px-6 py-3'>

                {/* Logo */}
                <Link to='/' onClick={closeMenu}>
                    <img src='/logo.svg' alt='Decolonize Healthcare' className='h-12 w-auto' />
                </Link>

                {/* Desktop nav - centered */}
                <nav className='hidden items-center gap-1 lg:flex'>
                    {navLinks.map(({ to, label }) =>
                        to === '/education' ? (
                            // Education dropdown
                            <div key={to} className='relative group'>
                                <NavLink
                                    to={to}
                                    className={({ isActive }) =>
                                        `rounded-full px-4 py-1.5 text-sm font-medium transition-colors flex items-center gap-1 ${isActive
                                            ? 'bg-brand-blush text-brand-crimson'
                                            : 'text-gray-600 hover:bg-brand-blush hover:text-brand-crimson'
                                        }`
                                    }
                                >
                                    Education
                                    <svg
                                        className='w-3 h-3 mt-0.5 transition-transform duration-200 group-hover:rotate-180'
                                        fill='none' viewBox='0 0 24 24' stroke='currentColor'
                                    >
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                                    </svg>
                                </NavLink>
                                {/* Dropdown panel */}
                                <div className='absolute top-full left-1/2 -translate-x-1/2 pt-1 hidden group-hover:block'>
                                    <div className='w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-1 overflow-hidden'>
                                        {educationSubpages.map(({ to: subTo, label: subLabel }) => (
                                            <Link
                                                key={subTo}
                                                to={subTo}
                                                className='block px-4 py-2 text-sm text-gray-700 hover:bg-brand-blush hover:text-brand-crimson transition-colors'
                                            >
                                                {subLabel}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === '/'}
                                className={({ isActive }) =>
                                    `rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${isActive
                                        ? 'bg-brand-blush text-brand-crimson'
                                        : 'text-gray-600 hover:bg-brand-blush hover:text-brand-crimson'
                                    }`
                                }
                            >
                                {label}
                            </NavLink>
                        )
                    )}
                </nav>

                {/* Desktop auth */}
                <div className='hidden lg:block'>
                    {user ? (
                        <>
                            <Link
                                to='/dashboard'
                                className='rounded-full bg-brand-crimson px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-coral'
                            >
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className='text-brand-crimson text-center ms-1 text-xs'
                            >Log Out</button>
                        </>
                    ) : (
                        <Link
                            to='/login'
                            className='rounded-full border border-brand-crimson px-5 py-2 text-sm font-medium text-brand-crimson transition-colors hover:bg-brand-blush'
                        >
                            Log In
                        </Link>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button
                    className='flex flex-col items-center justify-center gap-1.5 lg:hidden'
                    onClick={() => setMenuOpen(prev => !prev)}
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                >
                    <span
                        className={`block h-0.5 w-6 bg-brand-crimson transition-transform duration-200 ${menuOpen ? 'translate-y-2 rotate-45' : ''
                            }`}
                    />
                    <span
                        className={`block h-0.5 w-6 bg-brand-crimson transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''
                            }`}
                    />
                    <span
                        className={`block h-0.5 w-6 bg-brand-crimson transition-transform duration-200 ${menuOpen ? 'translate-y-2 -rotate-45' : ''
                            }`}
                    />
                </button>
            </div>

            {/* Mobile dropdown */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out lg:hidden ${menuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className='border-t border-brand-blush bg-brand-cream px-6 py-4'>
                    {/* Auth link at top */}
                    {user ? (
                        <>
                            <p
                                onClick={handleLogout}
                                className='text-brand-crimson text-center'
                            >
                                Log Out
                            </p>
                            <Link
                                to='/dashboard'
                                onClick={closeMenu}
                                className='mb-4 block rounded-full bg-brand-crimson px-5 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-brand-coral'
                            >
                                Dashboard
                            </Link>
                        </>
                    ) : (
                        <Link
                            to='/login'
                            onClick={closeMenu}
                            className='mb-4 block rounded-full border border-brand-crimson px-5 py-2 text-center text-sm font-medium text-brand-crimson transition-colors hover:bg-brand-blush'
                        >
                            Log In
                        </Link>
                    )}

                    <div className='mb-4 border-t border-brand-blush' />

                    {/* Nav links */}
                    <nav className='flex flex-col gap-3'>
                        {navLinks.map(({ to, label }) =>
                            to === '/education' ? (
                                // Education accordion
                                <div key={to}>
                                    <button
                                        onClick={() => setEduOpen(o => !o)}
                                        className='w-full flex items-center justify-between rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-brand-blush hover:text-brand-crimson transition-colors'
                                    >
                                        Education
                                        <svg
                                            className={`w-4 h-4 transition-transform duration-200 ${eduOpen ? 'rotate-180' : ''}`}
                                            fill='none' viewBox='0 0 24 24' stroke='currentColor'
                                        >
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                                        </svg>
                                    </button>
                                    {eduOpen && (
                                        <div className='mt-1 flex flex-col gap-1 border-l-2 border-brand-blush ml-4 pl-2'>
                                            <NavLink
                                                to='/education' end onClick={closeMenu}
                                                className={({ isActive }) =>
                                                    `rounded-full px-4 py-2 text-sm ${isActive ? 'text-brand-crimson font-medium' : 'text-gray-500 hover:text-brand-crimson'}`
                                                }
                                            >
                                                Education Home
                                            </NavLink>
                                            {educationSubpages.map(({ to: subTo, label: subLabel }) => (
                                                <NavLink
                                                    key={subTo} to={subTo} onClick={closeMenu}
                                                    className={({ isActive }) =>
                                                        `rounded-full px-4 py-2 text-sm ${isActive ? 'text-brand-crimson font-medium' : 'text-gray-500 hover:text-brand-crimson'}`

                                                    }
                                                >
                                                    {subLabel}
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                < NavLink
                                    key={to}
                                    to={to}
                                    end={to === '/'}
                                    onClick={closeMenu}
                                    className={({ isActive }) =>
                                        `rounded-full px-4 py-2 text-sm font-medium transition-colors ${isActive
                                            ? 'bg-brand-blush text-brand-crimson'
                                            : 'text-gray-600 hover:bg-brand-blush hover:text-brand-crimson'
                                        }`
                                    }
                                >
                                    {label}
                                </NavLink>
                            )
                        )}
                    </nav>
                </div>
            </div>
        </header >
    );
};

export default Navbar;