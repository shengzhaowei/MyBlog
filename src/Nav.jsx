import { NavLink, useLocation } from 'react-router-dom';
import { FaHome } from 'react-icons/fa'

const Navigation = () => {
    const handleClick = () => {
        window.location.reload()
        return null;
    }
    const {pathname} = useLocation();

    if (pathname !== "/")

    return (
    <div className='fixed top-4 left-4'>
    <nav>
        <ul>
            <li> <NavLink reloadDocument to="/" onClick={() => handleClick()}> <FaHome className="hover:scale-105" size = {30}>  </FaHome></NavLink></li>
        </ul>
    </nav>
    </div>
)};

export default Navigation;
