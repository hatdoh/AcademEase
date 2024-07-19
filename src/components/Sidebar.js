import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAdminDetails, getSuperAdmin, isSuperAdminLoggedIn, logout } from '../utils/Authentication';
import Swal from 'sweetalert2'; 
import { MdDashboard } from "react-icons/md";
import { SiGoogleclassroom } from "react-icons/si";
import { BsPersonSquare } from "react-icons/bs";
import { FaRegCalendarMinus } from "react-icons/fa";
import { PiExam } from "react-icons/pi";
import { FaClipboardQuestion } from "react-icons/fa6";
import { GrUserAdmin } from "react-icons/gr";
import { IoPersonAddSharp } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi"; 

function Sidebar() {
  const [open, setOpen] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState("Dashboard"); // Initial selected menu
  const location = useLocation();

  // SweetAlert confirmation dialog for logout
  const handleLogout = () => {
    Swal.fire({
      title: 'Logout',
      text: "Are you sure you want to log out?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  const defaultMenus = [
    { title: "Dashboard", icon: <MdDashboard size={24} />, link: "/" },
    { title: "Sections", icon: <SiGoogleclassroom size={24} />, link: "/sections" },
    { title: "Attendance Summary", icon: <BsPersonSquare size={24} />, link: "/attendance-summary" },
 //   { title: "SF2", icon: <FaRegCalendarMinus size={24} />, link: "/sf2" },
    { title: "Item Analysis", icon: <PiExam size={24} />, link: "/item-analysis" },
    { title: "Create Test Questions", icon: <FaClipboardQuestion size={24} />, link: "/create-questions" },
  ];

  const superAdminMenus = [
    ...defaultMenus,
    { title: "Add Account", icon: <IoPersonAddSharp size={24} />, link: "/add-account" },
    { title: "Logout", icon: <FiLogOut size={24} />, link: "#", onClick: handleLogout } // Updated logout button with handleLogout function
  ];

  const [menus, setMenus] = useState(defaultMenus);

  // Fetch admin details and super admin on component mount
  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        const adminDetails = await getAdminDetails(); // Adjust this based on your implementation in Authentication.js
        console.log('Admin Details:', adminDetails);
      } catch (error) {
        console.error('Failed to fetch admin details:', error.message);
      }
    };

    const fetchSuperAdmin = async () => {
      try {
        const superAdmin = await getSuperAdmin(); // Adjust this based on your implementation in Authentication.js
        console.log('Super Admin:', superAdmin);
      } catch (error) {
        console.error('Failed to fetch super admin:', error.message);
      }
    };

    fetchAdminDetails();
    fetchSuperAdmin();
  }, []);

  // Conditionally update menus based on super admin status
  useEffect(() => {
    if (isSuperAdminLoggedIn()) {
      setMenus(superAdminMenus);
    } else {
      setMenus([
        ...defaultMenus,
        { title: "Admin", icon: <GrUserAdmin size={24} />, link: "/admin-details" },
      ]);
    }
  }, []);

  // Update selectedMenu state based on current URL pathname
  useEffect(() => {
    const pathname = location.pathname;
    const menuItem = menus.find(menu => menu.link === pathname);
    if (menuItem) {
      setSelectedMenu(menuItem.title);
    } else {
      setSelectedMenu("Dashboard"); // Default to Dashboard if no matching menu item found
    }
  }, [location.pathname, menus]);

  const handleMenuClick = (title) => {
    setSelectedMenu(title);
  };



  return (
    <div className='fixed top-0 left-0 z-40 h-screen'>
      <div className={`${open ? 'w-80' : 'w-20'} duration-300 h-screen p-5 pt-8 bg-dark-purple relative`}>
{ /*        <img src={require("../res/img/control.png")} className={`absolute cursor-pointer rounded-full -right-3 top-9 w-7 border-2 border-dark-purple ${!open && 'rotate-180'}`} onClick={() => setOpen(!open)} /> */}
        <Link to={"/"}>
          <div className='flex gap-x-4 items-center'>
            <img src={require("../res/img/logo.png")} className={`cursor-pointer duration-500 ${open && "rotate-[360deg]"}`} alt="Logo" />
            <h1 className={`text-white origin-left font-medium text-xl duration-300 ${!open && 'scale-0'}`}>AcademEase</h1>
          </div>
        </Link>
        <ul className='pt-6'>
          {menus.map((menu, index) => (
            <li key={index} className={`text-white text-md flex items-center gap-x-4 cursor-pointer p-2 mt-4 hover:bg-light-white rounded-md ${menu.link === location.pathname && "bg-light-white"}`}>
              <Link to={menu.link} className="flex items-center" onClick={() => { handleMenuClick(menu.title); menu.onClick && menu.onClick(); }}>
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
