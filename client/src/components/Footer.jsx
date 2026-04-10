import { Link } from 'react-router-dom';

const learnLinks = [
    { to: '/programs', label: 'Programs' },
    { to: '/education', label: 'Education' },
    { to: '/articles', label: 'Articles' },
    { to: '/books', label: 'Books' },
];

const aboutLinks = [
    { to: '/about', label: 'About' },
    { to: '/partners', label: 'Partners' },
];

const accountLinks = [
    { to: '/login', label: 'Log In' },
    { to: '/register', label: 'Create Account' },
    { to: '/dashboard', label: 'Dashboard' },
];

const FooterLinkGroup = ({ title, links }) => (
    <div className='flex flex-col items-center text-center md:items-center md:text-left'>
        <div className='w-fit'>
            <h3 className='mb-3 text-xs font-semibold uppercase tracking-widest text-brand-crimson'>
                {title}
            </h3>
            <ul className='space-y-2'>
                {links.map(({ to, label }) => (
                    <li key={to}>
                        <Link
                            to={to}
                            className='text-sm text-gray-500 transition-colors hover:text-brand-crimson'
                        >
                            {label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

const Footer = () => (
    <footer className='border-t border-brand-blush bg-brand-cream'>
        <div className='mx-auto max-w-7xl px-6 py-12'>

            <div className='flex flex-col gap-8 md:flex-row md:items-start'>

                <div className='flex flex-col items-center text-center md:w-48 md:shrink-0 md:items-start md:text-left'>
                    <Link to='/'>
                        <img
                            src='/logo.svg'
                            alt='Decolonize Healthcare'
                            className='mb-4 h-16 w-auto'
                        />
                    </Link>
                    <p className='text-xs uppercase tracking-widest font-semibold text-brand-crimson'>
                        Reclaiming health on our own terms.
                    </p>
                    <div className='mt-5 md:mt-1  border-b border-black w-8/12 md:mx-0' />
                </div>

                {/* Link columns */}

                <div className='grid flex-1 grid-cols-2 gap-8 md:grid-cols-3'>
                    <FooterLinkGroup title='Learn' links={learnLinks} />
                    <FooterLinkGroup title='About' links={aboutLinks} />

                    <div className='col-span-2 flex flex-col items-center text-center md:col-span-1 md:items-center md:text-left'>
                        <div className='w-fit'>
                            <h3 className='mb-3 text-xs font-semibold uppercase tracking-widest text-brand-crimson'>
                                Account
                            </h3>
                            <ul className='space-y-2'>
                                {accountLinks.map(({ to, label }) => (
                                    <li key={to}>
                                        <Link
                                            to={to}
                                            className='text-sm text-gray-500 transition-colors hover:text-brand-crimson'
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className='mt-10 border-t border-brand-blush pt-6 text-center text-xs text-gray-400'>
                <div className='flex flex-col items-center gap-2 text-center md:flex-row md:justify-between md:text-left'>
                    <p>Proudly created by Owl Medicine</p>
                    <p>© {new Date().getFullYear()} Decolonize Healthcare. All rights reserved</p>
                    <p className='ml-2'>
                        Built by{' '}
                        <a href='https://michaelkaffel.com' target='_blank' rel='noreferrer' className='hover:text-brand-crimson underline'>
                            Michael Kaffel
                        </a>

                    </p>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;