import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAdminDetails } from '../utils/Authentication';
import { MdDashboard } from "react-icons/md";
import { SiGoogleclassroom } from "react-icons/si";
import { BsPersonSquare } from "react-icons/bs";
import { FaRegCalendarMinus } from "react-icons/fa";
import { PiExam } from "react-icons/pi";
import { FaClipboardQuestion } from "react-icons/fa6";
import { GrUserAdmin } from "react-icons/gr";


function Sidebar() {
  const [open, setOpen] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState("Dashboard"); // Initial selected menu
  const location = useLocation();
  const adminDetails = getAdminDetails();

  const Menus = [
    { title: "Dashboard", icon: <MdDashboard size={24} />, link: "/" },
    { title: "Sections", icon: <SiGoogleclassroom size={24} />, link: "/sections" },
    { title: "Attendance Summary", icon: <BsPersonSquare size={24} />, link: "/attendance-summary" },
    { title: "SF2", icon: <FaRegCalendarMinus size={24} />, link: "/sf2" },
    { title: "Item Analysis", icon: <PiExam size={24} />, link: "/item-analysis" },
    { title: "Create Test Questions", icon: <FaClipboardQuestion size={24} />, link: "/create-questions" },
    { title: "Admin Details", icon: <GrUserAdmin size={24} />, link: "/admin-details", gap: true },
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
            <li key={index} className={`text-white text-md flex items-center gap-x-4 cursor-pointer p-2 mt-4 hover:bg-light-white rounded-md ${menu.gap ? "mt-36" : "mt-2"} ${menu.link === location.pathname && "bg-light-white"}`}>
              <Link to={menu.link} className="flex items-center" onClick={() => handleMenuClick(menu.title)}>
                {React.cloneElement(menu.icon, { className: 'icon', size: '1em' })}
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
