import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Newspaper,
  Rule,
  Assessment,
  Notifications,
  Person,
  Logout,
  MenuBook,
} from "@mui/icons-material";
// import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
//   const navigate = useNavigate();

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    handleMenuClose();
    console.log("Logout clicked");
  };

  const menuItems = [
    { text: "News", icon: <Newspaper />, path: "/news" },
    { text: "Rules", icon: <Rule />, path: "/rules" },
    { text: "Reports", icon: <Assessment />, path: "/reports" },
    { text: "Notifications", icon: <Notifications />, path: "/notifications" },
  ];

  const renderDesktopMenu = () => (
    <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
      {menuItems.map((item) => (
        <Button
          key={item.text}
          color="inherit"
          startIcon={item.icon}
        //   component={Link}
          to={item.path}
          sx={{
            textTransform: "none",
            fontWeight: 500,
            px: 2,
            py: 1,
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 1,
            },
          }}
        >
          {item.text}
        </Button>
      ))}

      <IconButton
        size="large"
        edge="end"
        aria-label="account of current user"
        aria-controls="profile-menu"
        aria-haspopup="true"
        onClick={handleProfileMenuOpen}
        color="inherit"
        sx={{ ml: 2 }}
      >
        <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.light" }}>
          JD
        </Avatar>
      </IconButton>

      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            // navigate("/profile");
          }}
          sx={{ minWidth: 150 }}
        >
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">John Doe</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Logout</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );

  const renderMobileDrawer = () => (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={handleMobileToggle}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: "block", md: "none" },
        "& .MuiDrawer-paper": {
          boxSizing: "border-box",
          width: 280,
          backgroundColor: "#1976d2",
          color: "white",
        },
      }}
    >
      <Box sx={{ overflow: "auto", pt: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", px: 2, mb: 2 }}>
          <MenuBook sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Library Management
          </Typography>
        </Box>
        <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)", mb: 1 }} />

        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.text}
            //   component={Link}
              to={item.path}
              onClick={handleMobileToggle}
              sx={{
                color: "inherit",
                textDecoration: "none",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)", my: 1 }} />

        <List>
          <ListItem
            // component={Link}
            to="/profile"
            onClick={handleMobileToggle}
            sx={{
              color: "inherit",
              textDecoration: "none",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
              <Person />
            </ListItemIcon>
            <ListItemText primary="John Doe" />
          </ListItem>

          <ListItem
            onClick={() => {
              handleMobileToggle();
              handleLogout();
            }}
            sx={{
              color: "inherit",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={2}
        sx={{
          bgcolor: "#1976d2",
          backgroundImage: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleMobileToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <MenuBook sx={{ mr: 1, fontSize: 28 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                letterSpacing: 0.5,
                display: { xs: "none", sm: "block" },
              }}
            >
              Library Management System
            </Typography>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                letterSpacing: 0.5,
                display: { xs: "block", sm: "none" },
              }}
            >
              LMS
            </Typography>
          </Box>

          {renderDesktopMenu()}
        </Toolbar>
      </AppBar>

      {renderMobileDrawer()}
      <Toolbar />
    </>
  );
};

export default Header;
