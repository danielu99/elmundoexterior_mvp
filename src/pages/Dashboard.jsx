import { useEffect, useState } from "react";
import { getDashboard } from "../services/reportService";

function Dashboard() {

    const [dashboard, setDashboard] =
        useState(null);

    useEffect(() => {

        const loadDashboard = async () => {

            const data =
                await getDashboard();

            setDashboard(data);
        };

        loadDashboard();

    }, []);

    if (!dashboard) {
        return <p>Cargando...</p>;
    }

    return (
        <div>
            <h1>Dashboard</h1>

            <p>Productos: {dashboard.productos}</p>
            <p>Stock: {dashboard.stockTotal}</p>
            <p>Ventas: {dashboard.ventas}</p>
            <p>Total: ${dashboard.total}</p>

        </div>
    );
}

export default Dashboard;