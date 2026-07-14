import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";

import SidebarLayout from "./layout/SidebarLayout";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";

import ProtectedRoute
    from "./routes/ProtectedRoute";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/login"
                    element={
                        <Login />
                    }
                />

                <Route
                    element={
                        <ProtectedRoute>

                            <SidebarLayout />

                        </ProtectedRoute>
                    }
                >

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/products"
                        element={<Products />}
                    />

                    <Route
                        path="/purchases"
                        element={<Purchases />}
                    />

                    <Route
                        path="/sales"
                        element={<Sales />}
                    />

                    <Route
                        path="/reports"
                        element={<Reports />}
                    />

                </Route>

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>

    );
}

export default App;