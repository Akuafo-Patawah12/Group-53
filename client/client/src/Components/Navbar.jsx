import { NavLink } from "react-router-dom";
import "../Styles/Navbar.css";
import { Button } from "antd";
import { LogoutOutlined, DashboardOutlined, MenuOutlined } from "@ant-design/icons";
import useLogout from "../Hooks/Logout";
import { useState } from "react";
import { CloseOutlined } from "@ant-design/icons";

const Navbar = () => {
  const logout = useLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prevState) => !prevState);
  };

  return (
    <nav
      className="navbar"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '90px',
        backgroundColor: '#fff',
        color: '#444',
        borderBottom: '2px solid #ddd',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: '1.5rem',
          color: '#fff',
        }}
      >
        <img src={"/icon.jpeg"} alt="logo" style={{ height: "90px" }} />
      </h1>

      {/* Hamburger Menu Icon (visible on small screens) */}
      <div className="hamburger-menu" onClick={toggleMenu}>
        {isMenuOpen?<CloseOutlined/>:<MenuOutlined style={{ fontSize: "24px" }} />}
      </div>

      {/* Dropdown menu for small screens */}
      {isMenuOpen && (
        <div className="navbar-dropdown">
          <NavLink
            to="/u/dashboard"
            style={({ isActive }) => ({
              color: isActive ? '#1890ff' : '#333',
              fontWeight: isActive ? 'bold' : 'normal',
              textDecoration: 'none',
            })}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/u/attendance-records"
            style={({ isActive }) => ({
              color: isActive ? '#1890ff' : '#333',
              fontWeight: isActive ? 'bold' : 'normal',
              textDecoration: 'none',
            })}
          >
            Sign-ins
          </NavLink>

          <Button
            icon={<LogoutOutlined />}
            onClick={logout}
            danger
            type="primary"
          >
            Logout
          </Button>
        </div>
      )}

      {/* Navbar links for larger screens */}
      <div className="navbar-links">
        <NavLink
          to="/u/dashboard"
          style={({ isActive }) => ({
            color: isActive ? '#1890ff' : '#333',
            fontWeight: isActive ? 'bold' : 'normal',
            textDecoration: 'none',
          })}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/u/attendance-records"
          style={({ isActive }) => ({
            color: isActive ? '#1890ff' : '#333',
            fontWeight: isActive ? 'bold' : 'normal',
            textDecoration: 'none',
          })}
        >
          Sign-ins
        </NavLink>

        <Button
          icon={<LogoutOutlined />}
          onClick={logout}
          danger
          type="primary"
        >
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
