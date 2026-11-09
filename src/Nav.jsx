import { NavLink, useLocation } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

const Navigation = () => {
  const { pathname } = useLocation();

  if (pathname === '/' || pathname.startsWith('/posts/')) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4">
      <nav>
        <ul>
          <li>
            <NavLink reloadDocument to="/">
              <FaHome className="hover:scale-105" size={30} />
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navigation;
