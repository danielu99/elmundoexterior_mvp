import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import SidebarLayout from "./layout/SidebarLayout";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    element={<SidebarLayout />}
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