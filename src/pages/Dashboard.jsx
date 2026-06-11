import { useEffect, useState } from "react";
import { getDashboard } from "../services/reportService";

import {
    Grid,
    Card,
    CardContent,
    Typography,
    Container
} from "@mui/material";

function Dashboard() {

    const [dashboard, setDashboard] =
        useState(null);

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                const data =
                    await getDashboard();

                setDashboard(data);

            } catch (error) {

                console.error(error);

            }

        };

        loadDashboard();

    }, []);

    if (!dashboard) {

        return <p>Cargando...</p>;

    }

    return (

        <Container sx={{ mt: 4 }}>

            <Typography
                variant="h4"
                gutterBottom>

                Dashboard

            </Typography>

            <Grid container spacing={3}>

                <Grid size={{ xs: 12, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">
                                Productos
                            </Typography>

                            <Typography variant="h4">
                                {dashboard.productos}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">
                                Stock
                            </Typography>

                            <Typography variant="h4">
                                {dashboard.stockTotal}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">
                                Ventas
                            </Typography>

                            <Typography variant="h4">
                                {dashboard.ventas}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">
                                Ingresos
                            </Typography>

                            <Typography variant="h4">
                                $
                                {Number(
                                    dashboard.total
                                ).toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

            </Grid>

        </Container>

    );

}

export default Dashboard;