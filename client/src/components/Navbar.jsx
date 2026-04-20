import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';


const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/articles', label: 'Articles' },
    { to: '/programs', label: 'Programs' },
    { to: '/education', label: 'Education' },
    { to: '/about', label: 'About' },
    { to: '/books', label: 'Books' },
    { to: '/partners', label: 'Partners' },
];

const Navbar = () => {
    const user = useSelector(state => state.user.data);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const closeMenu = () => setMenuOpen(false);

    return (
        <header className={`sticky top-0 z-50 bg-brand-cream transition-shadow duration-200 ${scrolled ? 'shadow-lg' : 'shadow-none'
            }`} >
            <div className='mx-auto flex max-w-7xl items-center justify-between px-6 py-3'>
                <Link to='/' onClick={closeMenu}>
                    <img src='/logo.svg' alt='Decolonize Healthcare' className='h-12 w-auto' />
                </Link>

                {/* Desktop nav - centered */}
                <nav className='hidden items-center gap-1 lg:flex'>
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
                            <Link
                                className='text-brand-crimson text-center ms-1 text-xs'
                                to='/'
                            >Log Out</Link>
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
                            <p className='text-brand-crimson text-center'>Log Out</p>
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
                        {navLinks.map(({ to, label }) => (
                            <NavLink
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
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Navbar;