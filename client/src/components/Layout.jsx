import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

const Layout = () => (
    <div className='flex min-h-screen flex-col bg-brand-cream'>
        <Navbar />
        <main className='flex-1'>
            <Outlet />
        </main>
        <Footer />
    </div>
);

export default Layout;