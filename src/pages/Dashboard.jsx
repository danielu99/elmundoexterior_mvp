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
                    <Card
                        sx={{
                            height: "100%",
                            boxShadow: 3
                        }}
                    >
                        <CardContent
                            sx={{
                                textAlign: "center"
                            }}
                        >
                            <Typography
                                variant="subtitle1"
                                color="text.secondary"
                            >
                                Productos
                            </Typography>

                            <Typography
                                variant="h3"
                                fontWeight="bold"
                            >
                                {dashboard.productos}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                    <Card
                        sx={{
                            height: "100%",
                            boxShadow: 3
                        }}
                    >
                        <CardContent
                            sx={{
                                textAlign: "center"
                            }}
                        >
                            <Typography
                                variant="subtitle1"
                                color="text.secondary"
                            >
                                Stock
                            </Typography>

                            <Typography
                                variant="h3"
                                fontWeight="bold"
                            >
                                {dashboard.stockTotal}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                    <Card
                        sx={{
                            height: "100%",
                            boxShadow: 3
                        }}
                    >
                        <CardContent
                            sx={{
                                textAlign: "center"
                            }}
                        >
                            <Typography
                                variant="subtitle1"
                                color="text.secondary"
                            >
                                Ventas
                            </Typography>

                            <Typography
                                variant="h3"
                                fontWeight="bold"
                            >
                                {dashboard.ventas}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                    <Card
                        sx={{
                            height: "100%",
                            boxShadow: 3
                        }}
                    >
                        <CardContent
                            sx={{
                                textAlign: "center"
                            }}
                        >
                            <Typography
                                variant="subtitle1"
                                color="text.secondary"
                            >
                                Ingresos
                            </Typography>

                            <Typography
                                variant="h3"
                                fontWeight="bold"
                            >
                                {new Intl.NumberFormat(
                                    "es-MX",
                                    {
                                        style: "currency",
                                        currency: "MXN"
                                    }
                                ).format(
                                    dashboard.total
                                )}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

            </Grid>

        </Container>

    );

}

export default Dashboard;