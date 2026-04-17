import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/userSlice';
import AuthModal from './AuthModal';

const useScrollLock = (locked) => {
    useEffect(() => {
        document.body.style.overflow = locked ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; }
    }, [locked]);
};

const useDelayedUnmount = (active, delay = 300) => {
    const [mounted, setMounted] = useState(active);

    useEffect(() => {
        if (active) {
            setMounted(true);
        } else {
            const id = setTimeout(() => setMounted(false), delay);
            return () => clearTimeout(id);
        }
    }, [active, delay]);

    return mounted;
};

const BellIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 0 0-5-5.91V4a1 1 0 0 0-2 0v1.09A6 6 0 0 0 6 11v5l-2 2v1h16v-1l-2-2z" />
    </svg>
);

const ChevronIcon = ({ open }) => (
    <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
        aria-hidden="true"
        className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const CloseIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const Avatar = ({ user }) => {
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : '?';
    return user?.avatar ? (
        <img src={user.avatar} alt={user.name} className='h-8 w-8 rounded-full object-cover' />
    ) : (
        <span className='flex h-8 w-8 items-center justify-center rounded-full bg-brand-coral text-xs font-semibold text-white'>
            {initials}

        </span>
    )
};

const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/articles', label: 'Articles' },
    { to: '/programs', label: 'Programs' },
    { to: '/education', label: 'Education' },
    { to: '/about', label: 'About' },
    { to: '/books', label: 'Books' },
    { to: '/partners', label: 'Partners' },
];

const userMenuItems = [
    { to: '/profile', label: 'Profile' },
    { to: '/my-programs', label: 'My Programs' },
    { to: '/account', label: 'My Account' },
]



const Navbar = () => {
    const user = useSelector(state => state.user.data);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [authModal, setAuthModal] = useState({ open: false, mode: 'login' });

    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);

    const mobileMenuMounted = useDelayedUnmount(menuOpen);

    useScrollLock(menuOpen);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const handler = e => {
            if (menuOpen) return;
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [menuOpen]);

    useEffect(() => {
        if (!menuOpen || !mobileMenuRef.current) return;

        const focusable = mobileMenuRef.current.querySelectorAll(
            'a, button, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        const handleTab = e => {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };

        document.addEventListener('keydown', handleTab);
        first?.focus();
        return () => document.removeEventListener('keydown', handleTab);
    }, [menuOpen, userMenuOpen]);

    const closeMenu = () => { setMenuOpen(false); setUserMenuOpen(false); };
    const openAuth = (mode) => { setAuthModal({ open: true, mode }); closeMenu(); };
    const closeAuth = () => setAuthModal({ open: false, mode: 'login' });

    const handleLogout = async () => {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        dispatch(logout());
        closeMenu();
        navigate('/')
    };


    return (
        <>
            <header className={`sticky top-0 z-50 bg-brand-cream transition-shadow duration-200 ${scrolled ? 'shadow-lg' : 'shadow-none'
                }`} >
                <div className='mx-auto flex max-w-7xl items-center justify-between px-6 py-3'>

                    <Link to='/' onClick={closeMenu}>
                        <img src='/logo.svg' alt='Decolonize Healthcare' className='h-12 w-auto' />
                    </Link>

                    {/* Desktop nav */}
                    <div className='hidden lg:items-center lg:gap-1 lg:flex'>
                        {navLinks.map(({ to, label }) => (
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
                        ))}


                        {/* Desktop auth */}
                        <div className='ml-4 flex items-center gap-3'>
                            {user ? (
                                <>
                                    <button className='text-brand-crimson hover:opacity-70 transition-opacity' aria-label='Notifications'>
                                        <BellIcon />
                                    </button>

                                    <div className='relative' ref={dropdownRef}>
                                        <button
                                            onClick={() => setUserMenuOpen(prev => !prev)}
                                            className='flex items-center gap-1.5 hover:opacity-80 transition-opacity'
                                            aria-expanded={userMenuOpen}
                                            aria-label='User menu'
                                        >
                                            <Avatar user={user} />
                                            <ChevronIcon open={userMenuOpen} />
                                        </button>

                                        {userMenuOpen && (
                                            <div className='absolute right-0 top-full mt-2 w-44 rounded-lg border border-brand-blush bg-white py-1 shadow-lg'>
                                                {userMenuItems.map(({ to, label }) => (
                                                    <Link
                                                        key={to}
                                                        to={to}
                                                        onClick={() => setUserMenuOpen(false)}
                                                        className='block px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-blush hover:text-brand-crimson transition-colors'
                                                    >
                                                        {label}
                                                    </Link>
                                                ))}
                                                <hr className='my-1 border-brand-blush' />
                                                <button
                                                    onClick={handleLogout}
                                                    className='block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-brand-blush hover:text-brand-crimson transition-colors'
                                                >
                                                    Log Out
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <button
                                    onClick={() => openAuth('login')}
                                    className='rounded-full border border-brand-crimson px-5 py-2 text-sm font-medium text-brand-crimson transition-colors hover:bg-brand-blush'
                                >
                                    Log In
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mobile: bell (logged in) +  hamburger */}
                    <div className='flex items-center gap-3 lg:hidden'>
                        {user && (
                            <button className='text-brand-crimson hover:opacity-70 transition-opacity' aria-label='Notifications'>
                                <BellIcon />
                            </button>
                        )}
                        <button
                            className='flex flex-col items-center justify-center gap-1.5'
                            onClick={() => setMenuOpen(prev => !prev)}
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={menuOpen}
                        >
                            <span
                                className={`block h-0.5 w-6 bg-brand-crimson transition-transform duration-200 ${menuOpen ? '-translate-y-2 rotate-45' : ''
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
                </div>
            </header>

            {/* Mobile full-screen menu */}
            {mobileMenuMounted && (
                <div
                    ref={mobileMenuRef}
                    role='dialog'
                    aria-modal='true'
                    aria-label='Navigation menu'
                    className={`fixed inset-0 z-50 flex flex-col bg-brand-cream lg:hidden transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <div className='flex items-center justify-between px-6 py-4'>
                        {user ? (
                            <button
                                onClick={() => setUserMenuOpen(prev => !prev)}
                                className='flex items-center gap-2 text-brand-crimson'
                                aria-expanded={userMenuOpen}
                                aria-label='User menu'
                            >
                                <Avatar user={user} />
                                <ChevronIcon open={userMenuOpen} />
                            </button>
                        ) : (
                            <div />
                        )}

                        <button
                            onClick={closeMenu}
                            className='text-brand-crimson hover:opacity-60 transition-opacity'
                            aria-label='Close menu'
                        >
                            <CloseIcon />
                        </button>
                    </div>

                    <nav className='flex flex-1 flex-col items-center justify-center gap-2 overflow-y-auto px-6 pb-12 text-center'>
                        {user && userMenuOpen ? (
                            <>
                                {userMenuItems.map(({ to, label }) => (
                                    <Link
                                        key={to}
                                        to={to}
                                        onClick={closeMenu}
                                        className='py-2 text-xl font-medium text-gray-600 hover:text-brand-crimson transition-colors'
                                    >
                                        {label}
                                    </Link>
                                ))}
                                <hr className='my-2 w-24 border-brand-blush' />
                                <button
                                    onClick={handleLogout}
                                    className='py-2 text-xl font-medium text-gray-600 hover:text-brand-crimson transition-colors'
                                >
                                    Log Out
                                </button>
                                <hr className='my-2 w-24 border-brand-blush' />
                                {navLinks.map(({ to, label }) => (
                                    <NavLink
                                        key={to}
                                        to={to}
                                        end={to === '/'}
                                        onClick={closeMenu}
                                        className={({ isActive }) =>
                                            `py-2 text-xl font-medium transition-colors ${isActive ? 'text-brand-crimson' : 'text-gray-500 hover:text-brand-crimson'}`
                                        }
                                    >
                                        {label}
                                    </NavLink>
                                ))}
                            </>
                        ) : (
                            <>
                                {!user && (
                                    <>
                                        <button
                                            onClick={() => openAuth('login')}
                                            className='mb-2 rounded-full border border-brand-crimson px-8 py-2.5 text-sm font-medium text-brand-crimson hover:bg-brand-blush trnasition-colors'
                                        >
                                            Log In
                                        </button>
                                        <button
                                            onClick={() => openAuth('register')}
                                            className='mb-4 rounded-full bg-brand-crimson px-8 py-2.5 text-sm font-medium text-white hover:bg-brand-coral transition-colors'
                                        >
                                            Sign Up
                                        </button>
                                        <hr className='mb-4 w-24 border-brand-blush' />
                                    </>
                                )}
                                {navLinks.map(({ to, label }) => (
                                    <NavLink
                                        key={to}
                                        to={to}
                                        end={to === '/'}
                                        onClick={closeMenu}
                                        className={({ isActive }) =>
                                            `py-2 text-xl font-medium transition-colors ${isActive ? 'text-brand-crimson' : 'text-gray-500 hover:text-brand-crimson'
                                            }`
                                        }
                                    >
                                        {label}
                                    </NavLink>
                                ))}
                            </>
                        )}
                    </nav>
                </div>
            )}

            {authModal.open && (
                <AuthModal initialMode={authModal.mode} onClose={closeAuth} />
            )}
        </>
    );
};

export default Navbar;