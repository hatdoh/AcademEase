import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAdminDetails, getSuperAdmin, isSuperAdminLoggedIn, logout } from '../utils/Authentication';
import Swal from 'sweetalert2';
import { MdDashboard } from "react-icons/md";
import { SiGoogleclassroom } from "react-icons/si";
import { BsPersonSquare } from "react-icons/bs";
import { PiExam } from "react-icons/pi";
import { FaClipboardQuestion } from "react-icons/fa6";
import { GrUserAdmin } from "react-icons/gr";
import { IoPersonAddSharp } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, IconButton, useMediaQuery, AppBar, Toolbar } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { styled } from '@mui/system';
import logo from "../res/img/logo1.png";

const drawerWidth = 240;

const SidebarContainer = styled('div')(({ theme }) => ({
  display: 'flex',
}));

const SidebarDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: '#091e5d',
    color: '#FFFFFF',
  },
}));

const LogoContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '1.25rem',
  marginLeft: theme.spacing(1),
}));

function Sidebar() {
  const [selectedMenu, setSelectedMenu] = useState("Dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isMobile = useMediaQuery('(max-width:600px)');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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
    { title: "Dashboard", icon: <MdDashboard size={16} />, link: "/" },
    { title: "Sections", icon: <SiGoogleclassroom size={16} />, link: "/sections" },
    { title: "Attendance Summary", icon: <BsPersonSquare size={16} />, link: "/attendance-summary" },
    { title: "Item Analysis", icon: <PiExam size={16} />, link: "/item-analysis" },
    { title: "Create Test Questions", icon: <FaClipboardQuestion size={16} />, link: "/create-questions" },
  ];

  const superAdminMenus = [
    ...defaultMenus,
    { title: "Add Account", icon: <IoPersonAddSharp size={16} />, link: "/add-account" },
    { title: "Logout", icon: <FiLogOut size={16} />, link: "#", onClick: handleLogout }
  ];

  const [menus, setMenus] = useState(defaultMenus);

  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        const adminDetails = await getAdminDetails();
        console.log('Admin Details:', adminDetails);
      } catch (error) {
        console.error('Failed to fetch admin details:', error.message);
      }
    };

    const fetchSuperAdmin = async () => {
      try {
        const superAdmin = await getSuperAdmin();
        console.log('Super Admin:', superAdmin);
      } catch (error) {
        console.error('Failed to fetch super admin:', error.message);
      }
    };

    fetchAdminDetails();
    fetchSuperAdmin();
  }, []);

  useEffect(() => {
    if (isSuperAdminLoggedIn()) {
      setMenus(superAdminMenus);
    } else {
      setMenus([
        ...defaultMenus,
        { title: "Admin", icon: <GrUserAdmin size={16} />, link: "/admin-details" },
      ]);
    }
  }, []);

  useEffect(() => {
    const pathname = location.pathname;
    const menuItem = menus.find(menu => menu.link === pathname);
    if (menuItem) {
      setSelectedMenu(menuItem.title);
    } else {
      setSelectedMenu("Dashboard");
    }
  }, [location.pathname, menus]);

  const handleMenuClick = (title) => {
    setSelectedMenu(title);
    if (isMobile) {
      setMobileOpen(false); // Close the drawer on mobile after selecting a menu
    }
  };

  const drawerContent = (
    <div>
      <LogoContainer>
        <IconButton component={Link} to={"/"}>
          <img src={logo} alt="Logo" style={{ width: 40, height: 40 }} />
        </IconButton>
        <LogoText variant="h6" noWrap>
          AcademEase
        </LogoText>
      </LogoContainer>
      <List>
        {menus.map((menu, index) => (
          <ListItem
            button
            key={index}
            component={Link}
            to={menu.link}
            selected={selectedMenu === menu.title}
            onClick={() => {
              handleMenuClick(menu.title);
              menu.onClick && menu.onClick();
            }}
          >
            <ListItemIcon style={{ color: '#FFFFFF' }}>
              {menu.icon}
            </ListItemIcon>
            <ListItemText primary={menu.title} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <SidebarContainer>
      <AppBar position="fixed" sx={{ display: { md: 'none' } }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            AcademEase
          </Typography>
        </Toolbar>
      </AppBar>
      <SidebarDrawer
        variant={isMobile ? "temporary" : "permanent"}
        anchor="left"
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        {drawerContent}
      </SidebarDrawer>
    </SidebarContainer>
  );
}

export default Sidebar;
