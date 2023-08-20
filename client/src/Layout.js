import Headers from './Header';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <main>
            <Headers />
            <Outlet />
        </main>
    )
}

export default Layout;