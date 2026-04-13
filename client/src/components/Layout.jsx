import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

const Layout = () => (
    <div className='flex flex-col bg-brand-cream'>
        <Navbar />
        <main className='flex-1 min-h-screen flex flex-col'>
            <Outlet />
        </main>
        <Footer />
    </div>
);

export default Layout;