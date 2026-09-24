import { useEffect, useState } from "react";
import { getDashboard } from "../services/reportService";

import {
    Grid,
    Card,
    CardContent,
    Typography,
    Container,
    Box
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

    const formatMoney = (amount) =>

        new Intl.NumberFormat(
            "es-MX",
            {
                style: "currency",
                currency: "MXN"
            }
        ).format(amount ?? 0);

    const cardStyle = (bgColor) => ({

        bgcolor: bgColor,

        borderRadius: 3,

        boxShadow: 3,

        transition: "0.2s",

        height: "100%",

        "&:hover": {

            transform: "translateY(-4px)",

            boxShadow: 8

        }

    });

    return (

        <Container sx={{ mt: 4 }}>

            <Typography
                variant="h4"
                gutterBottom
            >

                Dashboard

            </Typography>

            {/* KPI PRINCIPAL */}

            <Card
                sx={{
                    mb: 4,
                    bgcolor: "#C8E6C9",
                    borderRadius: 4,
                    boxShadow: 5
                }}
            >

                <CardContent
                    sx={{
                        textAlign: "center",
                        py: 4
                    }}
                >

                    <Typography
                        variant="h6"
                        color="text.secondary"
                    >

                        🚀 Utilidad Real

                    </Typography>

                    <Typography
                        variant="h2"
                        fontWeight="bold"
                    >

                        {formatMoney(
                            dashboard.utilidadReal
                        )}

                    </Typography>

                </CardContent>

            </Card>

            {/* FILA 1 */}

            <Grid
                container
                spacing={3}
            >

                <Grid size={{ xs: 12, md: 3 }}>

                    <Card
                        sx={cardStyle("#E3F2FD")}
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

                                📦 Productos

                            </Typography>

                            <Typography
                                variant="h4"
                                fontWeight="bold"
                            >

                                {dashboard.productos}

                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>

                    <Card
                        sx={cardStyle("#E3F2FD")}
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

                                📚 Stock

                            </Typography>

                            <Typography
                                variant="h4"
                                fontWeight="bold"
                            >

                                {dashboard.stockTotal}

                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>

                    <Card
                        sx={cardStyle("#E8F5E9")}
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

                                🛒 Ventas

                            </Typography>

                            <Typography
                                variant="h4"
                                fontWeight="bold"
                            >

                                {dashboard.ventas}

                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>

                    <Card
                        sx={cardStyle("#E8F5E9")}
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

                                💵 Ventas sin IVA

                            </Typography>

                            <Typography
                                variant="h6"
                                fontWeight="bold"
                            >

                                {formatMoney(
                                    dashboard.subtotal
                                )}

                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>

            </Grid>

            {/* FILA 2 */}

            <Grid
                container
                spacing={3}
                sx={{ mt: 1 }}
            >

                <Grid size={{ xs: 12, md: 4 }}>

                    <Card
                        sx={cardStyle("#FFF3E0")}
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

                                📉 Costo mercancía

                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight="bold"
                            >

                                {formatMoney(
                                    dashboard.costoMercancia
                                )}

                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>

                    <Card
                        sx={cardStyle("#FFF3E0")}
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

                                🧾 Gastos

                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight="bold"
                            >

                                {formatMoney(
                                    dashboard.gastosVenta
                                )}

                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>

                    <Card
                        sx={cardStyle("#DCEDC8")}
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

                                📈 Resultado

                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight="bold"
                            >

                                {formatMoney(
                                    dashboard.utilidadReal
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