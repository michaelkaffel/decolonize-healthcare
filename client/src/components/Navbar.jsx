import { NavLink, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Logo from '/public/logo.avif';

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

    return (
        <header className='border-b border-brand-blush bg-white'>
            <div className='mx-auto flex max-w-7xl items-center justify-between px-6 py-4'>
                <Link to='/'>
                    <img src={Logo} className='h-16'/>
                </Link>

                <nav className='hidden items-center gap-6 md:flex'>
                    {navLinks.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) =>
                                `text-sm font-medium transition-colors ${isActive
                                    ? 'text-brand-crimson'
                                    : 'text-gray-600 hover:text-brand-crimson'
                                }`
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className='flex items-center gap-3'>
                    {user ? (
                        <Link
                            to='/dashboard'
                            className='rounded-md bg-brand-coral px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-crimson'
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <Link
                            to='/login'
                            className='text-sm font-medium text-brand-crimson hover:underline'
                        >
                            Log In
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;