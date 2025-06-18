import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUserMd,
    faHospital,
    faCog,
    faBars,
    faChevronLeft
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = () => {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        {
            title: 'Pengaturan',
            icon: faCog,
            path: '/',
            isHeader: true
        },
        {
            title: 'Jadwal Dokter',
            icon: faUserMd,
            path: '/jadwal'
        },
        {
            title: 'Pengaturan Poli',
            icon: faHospital,
            path: '/pengaturan-poli'
        }
    ];const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={toggleSidebar}
                className="md:hidden fixed top-4 left-4 z-20 bg-green-500 text-white p-3 rounded-lg"
            >
                <FontAwesomeIcon icon={faBars} />
            </button>

            {/* Overlay */}
            {isCollapsed && (
                <div 
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed top-0 left-0 h-screen bg-green-500 text-white z-40 w-[90px]
                transition-all duration-300 ease-in-out flex flex-col items-center pt-5
                ${isCollapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
            `}>
                {/* User Icon */}
                <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center mb-8">
                    <FontAwesomeIcon icon={faUserMd} className="text-2xl text-green-500" />
                </div>

                {/* Navigation */}
                <nav className="w-full">
                    <ul className="space-y-1 text-center">                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`
                                        flex flex-col items-center py-4 px-2
                                        transition-all duration-200 text-center
                                        ${location.pathname === item.path
                                            ? 'bg-white text-green-500'
                                            : 'text-white hover:bg-green-600'
                                        }
                                    `}
                                    title={item.title}
                                >
                                    <FontAwesomeIcon icon={item.icon} className="text-2xl mb-1" />
                                    <span className="text-xs whitespace-normal px-1">
                                        {item.title}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </>
    );
};

export default Sidebar;
