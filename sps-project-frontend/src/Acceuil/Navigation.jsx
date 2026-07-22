import React, { useState, useEffect } from "react";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import MuiDrawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import MenuIcon from "@mui/icons-material/Menu";
import { BiSolidPurchaseTag } from "react-icons/bi";
import { FaFileCircleQuestion } from "react-icons/fa6";
import { FaFileInvoiceDollar } from "react-icons/fa6";
import {
  ListItemButton,
  Collapse
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { styled } from "@mui/material/styles";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { Link } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar from "@mui/material/AppBar";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useOpen } from "./OpenProvider";

// Drawer width when opened
const drawerWidth = 290;

// Custom AppBar component
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: "#0b4d54",
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

// Custom Drawer component
const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "fixed",
    whiteSpace: "nowrap",
    width: drawerWidth,
    height: "100vh",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    backgroundColor: '#0b4d54', // Matched the darker teal from your images
    color: '#ffffff',
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(7),
      },
    }),
  },
}));

// Default theme
const defaultTheme = createTheme();

// Styled menu item component
const StyledMenuItem = styled(ListItem)(({ theme }) => ({
  padding: "8px 16px",
  marginBottom: "2px",
  borderLeft: "4px solid transparent",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderLeft: "4px solid #ffffff",
  },
  "&.submenu-item": {
    paddingLeft: "32px",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderLeft: "2px solid transparent",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      borderLeft: "2px solid #ffffff",
    },
  },
}));

// Styled logout button
const LogoutButton = styled(ListItem)(({ theme }) => ({
  backgroundColor: 'white',
  color: 'red',
  borderRadius: '4px',
  margin: '10px 16px',
  transition: 'all 0.2s ease',
  "&:hover": {
    backgroundColor: '#f5f5f5',
    transform: 'translateY(-2px)',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  }
}));

// Main Navigation component
const Navigation = () => {
  // State variables
  const [client, setClient] = useState(false);
  const [tarif, setTarif] = useState(false);
  const [chambres, setChambres] = useState(false); // New state for chambres submenu
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { open, toggleOpen } = useOpen();

  // Toggle drawer
  const handleToggle = () => {
    toggleOpen();
  };

  // Toggle submenu state
  const toggleSubmenu = (menu) => {
    if (menu === 'client') {
      setClient(!client);
    } else if (menu === 'tarif') {
      setTarif(!tarif);
    } else if (menu === 'chambres') {
      setChambres(!chambres);
    }
  };

  // Handle logout
  const handleLogoutClick = async () => {
    try {
      navigate("/login");
      logout();
    } catch (error) {
      console.error("Error during logout:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred during logout.",
      });
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <CssBaseline />
        
        {/* App Bar */}
        <AppBar position="fixed" open={open}>
          <Toolbar sx={{ pr: "24px" }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={handleToggle}
              sx={{
                marginRight: "36px",
                ...(open && { display: "none" }),
              }}>
              <MenuIcon />
            </IconButton>

            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            />
            
            {user && (
              <IconButton color="inherit">
                <Badge color="secondary">
                  <ListItem button sx={{ color: "white" }}>
                    <ListItemIcon>
                      <Avatar
                        alt={user[0]?.name || "User"}
                        src={user[0]?.photo}
                        sx={{ width: 40, height: 40 }}
                      />
                    </ListItemIcon>
                    <ListItemText primary={user[0]?.name || "User"} />
                  </ListItem>
                </Badge>
              </IconButton>
            )}
          </Toolbar>
        </AppBar>
        
        {/* Navigation Drawer */}
        <Drawer 
          variant="permanent" 
          open={open}
          sx={{
            '& .MuiDrawer-paper': {
              overflowY: 'auto',
              overflowX: 'hidden',
              scrollbarWidth: 'thin',
              scrollbarColor: '#ffffff40 transparent',
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#ffffff40',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
              },
            },
          }}
        >
          {/* Logo Area */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 16px',
            height: '64px',
          }}>
            {open ? (
              <Typography
                variant="h4"
                component="div"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  letterSpacing: '2px',
                }}
              >
                SPS
              </Typography>
            ) : (
              <Typography
                variant="h6"
                component="div"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                S
              </Typography>
            )}
          </Box>
          
          {/* Toggle button */}
          {open && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              padding: '0 16px',
            }}>
              <IconButton onClick={handleToggle} sx={{ color: '#ffffff' }}>
                <ChevronLeftIcon />
              </IconButton>
            </Box>
          )}
          
          <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '4px 0' }} />

          {/* Main Navigation Menu */}
          <List component="nav" sx={{ padding: '8px 0' }}>
            {/* Clients Menu */}
            <StyledMenuItem
              button
              onClick={() => toggleSubmenu('client')}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <BiSolidPurchaseTag style={{ color: 'white', fontSize: '20px' }} />
              </ListItemIcon>
              {open && (
                <>
                  <ListItemText 
                    primary="Clients" 
                    primaryTypographyProps={{ 
                      style: { 
                        fontWeight: client ? 'bold' : 'normal',
                        fontSize: '15px'
                      } 
                    }}
                  />
                  {client ? <ChevronRightIcon sx={{ color: 'white' }} /> : <ChevronLeftIcon sx={{ color: 'white' }} />}
                </>
              )}
            </StyledMenuItem>

            {/* Clients Submenu */}
            <Collapse in={client && open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <StyledMenuItem
                  button
                  component={Link}
                  to="/clients_particulier"
                  className="submenu-item"
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <FaFileCircleQuestion style={{ color: 'white', fontSize: '18px' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Clients Particulier" 
                    primaryTypographyProps={{ 
                      style: { 
                        fontSize: '14px' 
                      } 
                    }}
                  />
                </StyledMenuItem>

                <StyledMenuItem
                  button
                  component={Link}
                  to="/clients_societe"
                  className="submenu-item"
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <FaFileInvoiceDollar style={{ color: 'white', fontSize: '18px' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Clients Societe"
                    primaryTypographyProps={{ 
                      style: { 
                        fontSize: '14px' 
                      } 
                    }}
                  />
                </StyledMenuItem>

                <StyledMenuItem
                  button
                  component={Link}
                  to="/clientgrp"
                  className="submenu-item"
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <FaFileInvoiceDollar style={{ color: 'white', fontSize: '18px' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Clients par groupe"
                    primaryTypographyProps={{ 
                      style: { 
                        fontSize: '14px' 
                      } 
                    }}
                  />
                </StyledMenuItem>
              </List>
            </Collapse>

            {/* Tarifs Menu */}
            <StyledMenuItem
              button
              onClick={() => toggleSubmenu('tarif')}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <BiSolidPurchaseTag style={{ color: 'white', fontSize: '20px' }} />
              </ListItemIcon>
              {open && (
                <>
                  <ListItemText 
                    primary="Tarifs"
                    primaryTypographyProps={{ 
                      style: { 
                        fontWeight: tarif ? 'bold' : 'normal',
                        fontSize: '15px'
                      } 
                    }}
                  />
                  {tarif ? <ChevronRightIcon sx={{ color: 'white' }} /> : <ChevronLeftIcon sx={{ color: 'white' }} />}
                </>
              )}
            </StyledMenuItem>

            {/* Tarifs Submenu */}
            <Collapse in={tarif && open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <StyledMenuItem
                  button
                  component={Link}
                  to="/tarifs_repas"
                  className="submenu-item"
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <FaFileCircleQuestion style={{ color: 'white', fontSize: '18px' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Tarifs de Repas"
                    primaryTypographyProps={{ 
                      style: { 
                        fontSize: '14px' 
                      } 
                    }}
                  />
                </StyledMenuItem>

                <StyledMenuItem
                  button
                  component={Link}
                  to="/tarifs_chambre"
                  className="submenu-item"
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <FaFileInvoiceDollar style={{ color: 'white', fontSize: '18px' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Tarifs de Chambre"
                    primaryTypographyProps={{ 
                      style: { 
                        fontSize: '14px' 
                      } 
                    }}
                  />
                </StyledMenuItem>

                <StyledMenuItem
                  button
                  component={Link}
                  to="/tarifs_reduction"
                  className="submenu-item"
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <FaFileCircleQuestion style={{ color: 'white', fontSize: '18px' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Tarifs de Reduction"
                    primaryTypographyProps={{ 
                      style: { 
                        fontSize: '14px' 
                      } 
                    }}
                  />
                </StyledMenuItem>

                <StyledMenuItem
                  button
                  component={Link}
                  to="/tarifs_actuel"
                  className="submenu-item"
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <FaFileInvoiceDollar style={{ color: 'white', fontSize: '18px' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Tarifs Actuel"
                    primaryTypographyProps={{ 
                      style: { 
                        fontSize: '14px' 
                      } 
                    }}
                  />
                </StyledMenuItem>
              </List>
            </Collapse>

            {/* Chambres Menu - Modified to be a dropdown */}
            <StyledMenuItem
              button
              onClick={() => toggleSubmenu('chambres')}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <FaFileInvoiceDollar style={{ color: 'white', fontSize: '20px' }} />
              </ListItemIcon>
              {open && (
                <>
                  <ListItemText 
                    primary="Chambres"
                    primaryTypographyProps={{ 
                      style: { 
                        fontWeight: chambres ? 'bold' : 'normal',
                        fontSize: '15px'
                      } 
                    }}
                  />
                  {chambres ? <ChevronRightIcon sx={{ color: 'white' }} /> : <ChevronLeftIcon sx={{ color: 'white' }} />}
                </>
              )}
            </StyledMenuItem>

            {/* Chambres Submenu */}
            <Collapse in={chambres && open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
              <StyledMenuItem
                  button
                  component={Link}
                  to="/chambres"
                  className="submenu-item"
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <FaFileInvoiceDollar style={{ color: 'white', fontSize: '18px' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Liste des Chambres"
                    primaryTypographyProps={{ 
                      style: { 
                        fontSize: '14px' 
                      } 
                    }}
                  />
                </StyledMenuItem>
                <StyledMenuItem
                  button
                  component={Link}
                  to="/chambres-disponibles"
                  className="submenu-item"
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <FaFileInvoiceDollar style={{ color: 'white', fontSize: '18px' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Chambres Disponibles"
                    primaryTypographyProps={{ 
                      style: { 
                        fontSize: '14px' 
                      } 
                    }}
                  />
                </StyledMenuItem>
                <StyledMenuItem
                  button
                  component={Link}
                  to="/etat-chambre"
                  className="submenu-item"
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <FaFileInvoiceDollar style={{ color: 'white', fontSize: '18px' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Etat Chambre"
                    primaryTypographyProps={{ 
                      style: { 
                        fontSize: '14px' 
                      } 
                    }}
                  />
                </StyledMenuItem>

              </List>
            </Collapse>

            {/* Réclamations Menu */}
            <StyledMenuItem
              button
              component={Link}
              to="/reclamations"
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <FaFileInvoiceDollar style={{ color: 'white', fontSize: '20px' }} />
              </ListItemIcon>
              {open && (
                <ListItemText 
                  primary="Réclamations"
                  primaryTypographyProps={{ 
                    style: { 
                      fontSize: '15px' 
                    } 
                  }}
                />
              )}
            </StyledMenuItem>
            <StyledMenuItem
              button
              component={Link}
              to="/reservations"
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <FaFileInvoiceDollar style={{ color: 'white', fontSize: '20px' }} />
              </ListItemIcon>
              {open && (
                <ListItemText 
                  primary="Réservations"
                  primaryTypographyProps={{ 
                    style: { 
                      fontSize: '15px' 
                    } 
                  }}
                />
              )}
            </StyledMenuItem>

          </List>

            <StyledMenuItem
              button
              component={Link}
              to="/affichage"
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <FaFileInvoiceDollar style={{ color: 'white', fontSize: '20px' }} />
              </ListItemIcon>
              {open && (
                <ListItemText 
                  primary="Echange de monnais"
                  primaryTypographyProps={{ 
                    style: { 
                      fontSize: '15px' 
                    } 
                  }}
                />
              )}
            </StyledMenuItem>

            <StyledMenuItem
              button
              component={Link}
              to="/prixdevise"
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <FaFileInvoiceDollar style={{ color: 'white', fontSize: '20px' }} />
              </ListItemIcon>
              {open && (
                <ListItemText 
                  primary="Definit prix"
                  primaryTypographyProps={{ 
                    style: { 
                      fontSize: '15px' 
                    } 
                  }}
                />
              )}
            </StyledMenuItem>

            <StyledMenuItem
              button
              component={Link}
              to="/echange"
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <FaFileInvoiceDollar style={{ color: 'white', fontSize: '20px' }} />
              </ListItemIcon>
              {open && (
                <ListItemText 
                  primary="Echange"
                  primaryTypographyProps={{ 
                    style: { 
                      fontSize: '15px' 
                    } 
                  }}
                />
              )}
            </StyledMenuItem>
          
          
          {/* Spacer to push logout to bottom */}
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Logout Button */}
          <LogoutButton
            button
            onClick={handleLogoutClick}
          >
            
            <ListItemIcon>
              <ExitToAppIcon style={{ color: "red" }} />
            </ListItemIcon>
            {open && (
              <ListItemText 
                primary="Se déconnecter" 
                primaryTypographyProps={{ 
                  style: { 
                    color: 'red',
                    fontWeight: 'medium'
                  } 
                }}
              />
            )}
          </LogoutButton>
        </Drawer>
      </Box>
    </ThemeProvider>
  );
};

export default Navigation;
