import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import AssessmentIcon from "@mui/icons-material/Assessment";
import LogoutIcon from "@mui/icons-material/Logout";

import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Toolbar,
    Typography
} from "@mui/material";

const drawerWidth = 240;


function SidebarLayout() {
    const location =
        useLocation();

    const navigate =
        useNavigate();
        
    const handleLogout =
        () => {

            localStorage.removeItem(
                "authToken"
            );

            navigate(
                "/login"
            );
        };
    return (

        <Box sx={{ display: "flex" }}>

            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box"
                    }
                }}
            >

                <Toolbar>

                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: "bold"
                        }}
                    >

                        El Mundo Exterior

                    </Typography>

                </Toolbar>

                <List>

                    <ListItem disablePadding>

                        <ListItemButton
                            component={Link}
                            to="/dashboard"
                            selected={location.pathname === "/dashboard"}
                            sx={{
                                borderRadius: 2,
                                mx: 1,
                                my: 0.5,
                                "&.Mui-selected": {
                                    backgroundColor: "#e3f2fd",
                                    fontWeight: "bold"
                                }
                            }}
                        >

                            <DashboardIcon sx={{ mr: 2 }} />

                            <ListItemText
                                primary="Dashboard"
                            />

                        </ListItemButton>

                    </ListItem>

                    <ListItem disablePadding>

                        <ListItemButton
                            component={Link}
                            to="/products"
                            selected={location.pathname === "/products"}
                            sx={{
                                borderRadius: 2,
                                mx: 1,
                                my: 0.5,
                                "&.Mui-selected": {
                                    backgroundColor: "#e3f2fd",
                                    fontWeight: "bold"
                                }
                            }}>

                            <InventoryIcon sx={{ mr: 2 }} />

                            <ListItemText
                                primary="Productos"
                            />

                        </ListItemButton>

                    </ListItem>

                    <ListItem disablePadding>

                        <ListItemButton
                            component={Link}
                            to="/purchases"
                            selected={location.pathname === "/purchases"}
                            sx={{
                                borderRadius: 2,
                                mx: 1,
                                my: 0.5,
                                "&.Mui-selected": {
                                    backgroundColor: "#e3f2fd",
                                    fontWeight: "bold"
                                }
                            }}>

                            <ShoppingCartIcon sx={{ mr: 2 }} />

                            <ListItemText
                                primary="Compras"
                            />

                        </ListItemButton>

                    </ListItem>

                    <ListItem disablePadding>

                        <ListItemButton
                            component={Link}
                            to="/sales"
                            selected={location.pathname === "/sales"}
                            sx={{
                                borderRadius: 2,
                                mx: 1,
                                my: 0.5,
                                "&.Mui-selected": {
                                    backgroundColor: "#e3f2fd",
                                    fontWeight: "bold"
                                }
                            }}>

                            <PointOfSaleIcon sx={{ mr: 2 }} />

                            <ListItemText
                                primary="Ventas"
                            />

                        </ListItemButton>

                    </ListItem>

                    <ListItem disablePadding>

                        <ListItemButton
                            component={Link}
                            to="/reports"
                            selected={location.pathname === "/reports"}
                            sx={{
                                borderRadius: 2,
                                mx: 1,
                                my: 0.5,
                                "&.Mui-selected": {
                                    backgroundColor: "#e3f2fd",
                                    fontWeight: "bold"
                                }
                            }}>

                            <AssessmentIcon sx={{ mr: 2 }} />

                            <ListItemText
                                primary="Reportes"
                            />


                        </ListItemButton>

                    </ListItem>
                    <ListItem disablePadding>

                        <ListItemButton
                            onClick={
                                handleLogout
                            }
                            sx={{
                                borderRadius: 2,
                                mx: 1,
                                my: 0.5
                            }}
                        >

                            <LogoutIcon
                                sx={{ mr: 2 }}
                            />

                            <ListItemText
                                primary="Cerrar sesión"
                            />

                        </ListItemButton>

                    </ListItem>

                </List>

            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3
                }}
            >

                <Outlet />

            </Box>

        </Box>

    );
}

export default SidebarLayout;