import { useState } from "react";

import {
    Paper,
    Typography,
    TextField,
    Button,
    Stack,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";

import {
    getSalesSummary,
    getMonthlySales,
    getPendingInvoiceSummary,
    getPendingInvoiceSales,
    markAsInvoiced,
    exportPendingInvoiceSalesCsv
} from "../services/reportService";

function Reports() {

    const [summary, setSummary] =
        useState(null);

    const [monthly, setMonthly] =
        useState(null);

    const [pending, setPending] =
        useState(null);

    const [month, setMonth] =
        useState(new Date().getMonth() + 1);

    const [year, setYear] =
        useState(new Date().getFullYear());

    const [pendingSales, setPendingSales] =
        useState([]);

    const loadSummary = async () => {

        const data =
            await getSalesSummary();

        setSummary(data);
    };

    const loadMonthly = async () => {

        const data =
            await getMonthlySales(
                year,
                month
            );

        setMonthly(data);
    };

    const loadPending = async () => {

        const summary =
            await getPendingInvoiceSummary(
                year,
                month
            );

        const sales =
            await getPendingInvoiceSales(
                year,
                month
            );

        setPending(summary);

        setPendingSales(sales);

    };

    const downloadCsv = async () => {
        try {
            const blob =
                await exportPendingInvoiceSalesCsv(
                    year,
                    month
                );

            const url =
                window.URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                `ventas_pendientes_${year}_${month}.csv`;

            document.body.appendChild(
                link
            );

            link.click();

            link.remove();

        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAsInvoiced =
        async () => {

            const confirmed =
                window.confirm(
                    `¿Marcar todas las ventas pendientes de ${month}/${year} como facturadas?`
                );

            if (!confirmed) {
                return;
            }

            try {

                const updated =
                    await markAsInvoiced(
                        year,
                        month
                    );

                alert(
                    `${updated} ventas marcadas como facturadas`
                );

                await loadPending();

                await loadMonthly();

            } catch (error) {

                console.error(error);

                alert(
                    "Ocurrió un error"
                );
            }
        };

    return (

        <Stack spacing={3}>

            <Typography variant="h4">

                Reportes

            </Typography>

            <Paper sx={{ p: 3 }}>

                <Typography
                    variant="h6"
                    gutterBottom>

                    Resumen General

                </Typography>

                <Button
                    variant="contained"
                    onClick={loadSummary}
                >

                    Generar

                </Button>

                {
                    summary && (

                        <Stack
                            spacing={1}
                            sx={{ mt: 2 }}
                        >

                            <Typography>
                                Ventas:
                                {" "}
                                {summary.totalVentas}
                            </Typography>

                            <Typography>
                                Subtotal:
                                {" $"}
                                {summary.subtotal}
                            </Typography>

                            <Typography>
                                IVA:
                                {" $"}
                                {summary.iva}
                            </Typography>

                            <Typography>
                                Total:
                                {" $"}
                                {summary.total}
                            </Typography>

                        </Stack>

                    )
                }

            </Paper>

            <Paper sx={{ p: 3 }}>

                <Typography
                    variant="h6"
                    gutterBottom>

                    Ventas Mensuales

                </Typography>

                <Stack
                    direction="row"
                    spacing={2}
                    sx={{ mb: 2 }}
                >

                    <TextField
                        label="Mes"
                        type="number"
                        value={month}
                        onChange={(e) =>
                            setMonth(
                                Number(
                                    e.target.value
                                )
                            )
                        }
                    />

                    <TextField
                        label="Año"
                        type="number"
                        value={year}
                        onChange={(e) =>
                            setYear(
                                Number(
                                    e.target.value
                                )
                            )
                        }
                    />

                    <Button
                        variant="contained"
                        onClick={loadMonthly}
                    >

                        Generar

                    </Button>

                </Stack>

                {
                    monthly && (

                        <Stack spacing={1}>

                            <Typography>
                                Ventas:
                                {" "}
                                {monthly.ventas}
                            </Typography>

                            <Typography>
                                Facturadas:
                                {" "}
                                {monthly.facturadas}
                            </Typography>

                            <Typography>
                                Pendientes:
                                {" "}
                                {monthly.pendientesFacturar}
                            </Typography>

                            <Divider />

                            <Typography>
                                Subtotal:
                                {" $"}
                                {monthly.subtotal}
                            </Typography>

                            <Typography>
                                IVA:
                                {" $"}
                                {monthly.iva}
                            </Typography>

                            <Typography>
                                Total:
                                {" $"}
                                {monthly.total}
                            </Typography>

                        </Stack>

                    )
                }

            </Paper>

            <Paper sx={{ p: 3 }}>

                <Typography
                    variant="h6"
                    gutterBottom>

                    Pendiente de Facturar

                </Typography>

                <Stack
                    direction="row"
                    spacing={2}
                    sx={{ mb: 2 }}
                >

                    <Button
                        variant="contained"
                        onClick={loadPending}
                    >
                        Generar
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={downloadCsv}
                        disabled={
                            pendingSales.length === 0
                        }
                    >
                        Exportar CSV
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleMarkAsInvoiced}
                        disabled={
                            pendingSales.length === 0
                        }
                    >
                        Marcar Facturadas
                    </Button>

                </Stack>

                {
                    pending && (

                        <Stack
                            spacing={1}
                            sx={{ mt: 2 }}
                        >

                            <Typography>
                                Ventas:
                                {" "}
                                {pending.ventas}
                            </Typography>

                            <Typography>
                                Subtotal:
                                {" $"}
                                {pending.subtotal}
                            </Typography>

                            <Typography>
                                IVA:
                                {" $"}
                                {pending.iva}
                            </Typography>

                            <Typography>
                                Total:
                                {" $"}
                                {pending.total}
                            </Typography>

                        </Stack>

                    )
                }
                {
                    pendingSales.length > 0 && (

                        <TableContainer
                            component={Paper}
                            sx={{ mt: 3 }}
                        >

                            <Table>

                                <TableHead>

                                    <TableRow>

                                        <TableCell>
                                            Venta
                                        </TableCell>

                                        <TableCell>
                                            Fecha
                                        </TableCell>

                                        <TableCell>
                                            Canal
                                        </TableCell>

                                        <TableCell>
                                            Método Pago
                                        </TableCell>

                                        <TableCell align="right">
                                            Subtotal
                                        </TableCell>

                                        <TableCell align="right">
                                            IVA
                                        </TableCell>

                                        <TableCell align="right">
                                            Total
                                        </TableCell>

                                    </TableRow>

                                </TableHead>

                                <TableBody>

                                    {
                                        pendingSales.map(
                                            (sale) => (

                                                <TableRow
                                                    key={sale.ventaId}
                                                >

                                                    <TableCell>
                                                        #{sale.ventaId}
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            new Date(
                                                                sale.fecha
                                                            ).toLocaleDateString()
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        {sale.canalVenta}
                                                    </TableCell>

                                                    <TableCell>
                                                        {sale.metodoPago}
                                                    </TableCell>

                                                    <TableCell align="right">
                                                        $
                                                        {
                                                            Number(
                                                                sale.subtotal
                                                            ).toFixed(2)
                                                        }
                                                    </TableCell>

                                                    <TableCell align="right">
                                                        $
                                                        {
                                                            Number(
                                                                sale.iva
                                                            ).toFixed(2)
                                                        }
                                                    </TableCell>

                                                    <TableCell align="right">
                                                        $
                                                        {
                                                            Number(
                                                                sale.total
                                                            ).toFixed(2)
                                                        }
                                                    </TableCell>

                                                </TableRow>

                                            )
                                        )
                                    }

                                </TableBody>

                            </Table>

                        </TableContainer>

                    )
                }

            </Paper>

        </Stack>

    );
}

export default Reports;