import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
    const [open, setOpen] = useState(true);
    const [selectedMenu, setSelectedMenu] = useState("Dashboard"); // Initial selected menu
    const location = useLocation();

    const Menus = [
        { title: "Dashboard", icon: "chart_fill", link: "/" },
        { title: "Sections", icon: "chat", link: "/sections" },
        { title: "Attendance Summary", icon: "user", link: "/attendance-summary" },
        { title: "SF2", icon: "calendar", link: "/sf2" },
        { title: "Item Analysis", icon: "search", link: "/item-analysis" },
        { title: "Create Test Questions", icon: "chart", link: "/create-questions" },
        { title: "Admin", icon: "user", link: "/account" },
    ];

    // Update selectedMenu state based on current URL pathname
    useEffect(() => {
        const pathname = location.pathname;
        const menuItem = Menus.find(menu => menu.link === pathname);
        if (menuItem) {
            setSelectedMenu(menuItem.title);
        } else {
            setSelectedMenu("Dashboard"); // Default to Dashboard if no matching menu item found
        }
    }, [location.pathname, Menus]);

    const handleMenuClick = (title) => {
        setSelectedMenu(title);
    };

    return (
        <div className='flex'>
            <div className={`${open ? 'w-80' : 'w-20'} duration-300 h-screen p-5 pt-8 bg-dark-purple relative`}>
                <img src={require("../res/img/control.png")} className={`absolute cursor-pointer rounded-full -right-3 top-9 w-7 border-2 border-dark-purple ${!open && 'rotate-180'}`} onClick={() => setOpen(!open)} />
                <div className='flex gap-x-4 items-center'>
                    <img src={require("../res/img/logo.png")} className={`cursor-pointer duration-500 ${open && "rotate-[360deg]"}`} alt="Logo" />
                    <h1 className={`text-white origin-left font-medium text-xl duration-300 ${!open && 'scale-0'}`}>AcademEase</h1>
                </div>
                <ul className='pt-6'>
                    {Menus.map((menu, index) => (
                        <li key={index} className={`text-white text-md flex items-center gap-x-4 cursor-pointer p-2 mt-4 hover:bg-light-white rounded-md ${menu.link === location.pathname && "bg-light-white"}`}>
                            <Link to={menu.link} className="flex items-center" onClick={() => handleMenuClick(menu.title)}>
                                <img src={require(`../res/img/${menu.icon}.png`)} alt={menu.title} className="h-6 w-6" />
                                <span className={`ml-2 ${!open && 'hidden'} duration-200`}>{menu.title}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Sidebar;