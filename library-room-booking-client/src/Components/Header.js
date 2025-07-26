import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import Badge from '@mui/material/Badge';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';

const pages = [
    { label: 'Booking Room', path: '/home', roles: [1, 2, 3] },
    { label: 'News', path: '/news', roles: [1, 2] },
    { label: 'Rules', path: '/rules', roles: [2] },
    { label: 'Reports', path: '/reports', roles: [2] },
    { label: 'Report History', path: '/history-report', roles: [1] },
    { label: 'Add Report', path: '/add-report', roles: [1] },
];

const settings = ['Profile', 'Logout'];

function Header() {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const navigate = useNavigate();
    const { role, setRole } = useAuth();

    console.log('Header - Role:', role);

    const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
    const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
    const handleCloseNavMenu = () => setAnchorElNav(null);
    const handleCloseUserMenu = () => setAnchorElUser(null);

    const handleLogout = async () => {
        try {
            await fetch('https://localhost:7238/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (err) {
            console.error('Logout failed', err);
        }

        localStorage.removeItem('authToken');
        localStorage.removeItem('role');
        sessionStorage.clear();
        setRole(null);

        handleCloseUserMenu();
        navigate('/login', { replace: true });
    };

    const handleMenuItemClick = (setting) => {
        if (setting === 'Logout') {
            handleLogout();
        } else if (setting === 'Profile') {
            navigate('/student/profile');
            handleCloseUserMenu();
        } else {
            handleCloseUserMenu();
        }
    };

    const handleNavMenuClick = (page) => {
        if (page === 'Home') {
            navigate('/home');
        }
        handleCloseNavMenu();
    };

    const handleSettingClick = (setting) => {
        if (setting === 'Logout') {
            handleLogout();
        } else if (setting === 'Profile') {
            if (role === 1) navigate('/student/profile');
            else if (role === 2) navigate('/user/students');
            else if (role === 3) navigate('/admin');
            handleCloseUserMenu();
        }
    };

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="#"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        LOGO
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                            keepMounted
                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{ display: { xs: 'block', md: 'none' } }}
                        >
                            {pages.filter(p => p.roles.includes(role)).map((page) => (
                                <MenuItem
                                    key={page.label}
                                    onClick={() => {
                                        console.log('Navigating to:', page.path);
                                        navigate(page.path);
                                        handleCloseNavMenu();
                                    }}
                                >
                                    <Typography textAlign="center">{page.label}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>

                    <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="#"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        LOGO
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages.filter(p => p.roles.includes(role)).map((page) => (
                            <Button
                                key={page.label}
                                onClick={() => {
                                    console.log('Navigating to:', page.path);
                                    navigate(page.path);
                                }}
                                sx={{ my: 2, color: 'white', display: 'block' }}
                            >
                                {page.label}
                            </Button>
                        ))}
                    </Box>

                    <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 2 }}>

                        <Tooltip title="Account settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <AccountCircle fontSize="large" />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            keepMounted
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            {settings.map((setting) => (
                                <MenuItem key={setting} onClick={() => handleSettingClick(setting)}>
                                    <Typography textAlign="center">{setting}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default Header;