import {
    useState,
    useEffect
} from "react";

import dayjs from "dayjs";
import "dayjs/locale/es";

import {
    Grid,
    Typography,
    Stack,
    Paper,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip
} from "@mui/material";

import {
    LocalizationProvider
} from "@mui/x-date-pickers";

import {
    AdapterDayjs
} from "@mui/x-date-pickers/AdapterDayjs";

import {
    DatePicker
} from "@mui/x-date-pickers/DatePicker";

import {
    getSalesSummary,
    getPendingInvoiceSummary,
    getPendingInvoiceSales,
    markAsInvoiced,
    exportPendingInvoiceSalesCsv
} from "../services/reportService";

function Reports() {

    const [summary, setSummary] =
        useState(null);

    const [pending, setPending] =
        useState(null);

    const [pendingSales, setPendingSales] =
        useState([]);

    const [selectedDate,
        setSelectedDate] =
        useState(dayjs());

    const formatMoney = (amount) =>
        new Intl.NumberFormat(
            "es-MX",
            {
                style: "currency",
                currency: "MXN"
            }
        ).format(amount ?? 0);

    const Metric = ({
        label,
        value,
        emphasis = false
    }) => (

        <Stack spacing={0.5}>

            <Typography
                variant="body2"
                color="text.secondary"
            >
                {label}
            </Typography>

            <Typography
                variant={emphasis ? "h5" : "h6"}
                fontWeight={emphasis ? 700 : 500}
            >
                {value}
            </Typography>

        </Stack>

    );

    const loadSummary = async () => {

        try {

            const data =
                await getSalesSummary();

            setSummary(data);

        } catch (error) {

            console.error(error);
        }
    };

    const loadPending = async (date = selectedDate) => {

        try {

            const [
                summaryData,
                salesData
            ] = await Promise.all([

                getPendingInvoiceSummary(
                    date.year(),
                    date.month() + 1
                ),

                getPendingInvoiceSales(
                    date.year(),
                    date.month() + 1
                )

            ]);

            setPending(summaryData);

            setPendingSales(salesData);

        } catch (error) {

            console.error(error);
        }
    };

    const downloadCsv = async () => {

        try {

            const blob =
                await exportPendingInvoiceSalesCsv(
                    selectedDate.year(),
                    selectedDate.month() + 1
                );

            const url =
                window.URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                `ventas_pendientes_${selectedDate.year()}_${selectedDate.month() + 1}.csv`;

            document.body.appendChild(
                link
            );

            link.click();

            link.remove();

            window.URL.revokeObjectURL(
                url
            );

        } catch (error) {

            console.error(error);
        }
    };

    const handleMarkAsInvoiced =
        async () => {

            const month =
                selectedDate.month() + 1;

            const year =
                selectedDate.year();

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

                await Promise.all([
                    loadPending(),
                    loadSummary()
                ]);

            } catch (error) {

                console.error(error);

                alert(
                    "Ocurrió un error"
                );
            }
        };

    useEffect(() => {

        loadSummary();

    }, []);

    useEffect(() => {

        loadPending(
            selectedDate
        );

    }, [selectedDate]);

    return (

        <Stack spacing={3}>

            <Typography variant="h4">
                Reportes
            </Typography>

            {/* RESUMEN GENERAL */}

            <Paper
                sx={{
                    p: 3
                }}
            >

                <Typography
                    variant="h6"
                    sx={{ mb: 3 }}
                >
                    Resumen general
                </Typography>

                {
                    summary && (

                        <Grid
                            container
                            spacing={3}
                        >

                            <Grid
                                size={{
                                    xs: 6,
                                    md: 3
                                }}
                            >
                                <Metric
                                    label="Ventas"
                                    value={
                                        summary.totalVentas
                                    }
                                />
                            </Grid>

                            <Grid
                                size={{
                                    xs: 6,
                                    md: 3
                                }}
                            >
                                <Metric
                                    label="Subtotal"
                                    value={
                                        formatMoney(
                                            summary.subtotal
                                        )
                                    }
                                />
                            </Grid>

                            <Grid
                                size={{
                                    xs: 6,
                                    md: 3
                                }}
                            >
                                <Metric
                                    label="IVA"
                                    value={
                                        formatMoney(
                                            summary.iva
                                        )
                                    }
                                />
                            </Grid>

                            <Grid
                                size={{
                                    xs: 6,
                                    md: 3
                                }}
                            >
                                <Metric
                                    label="Total"
                                    value={
                                        formatMoney(
                                            summary.total
                                        )
                                    }
                                    emphasis
                                />
                            </Grid>

                        </Grid>

                    )
                }

            </Paper>

            {/* PERIODO + PENDIENTES */}

            <Grid
                container
                spacing={3}
                alignItems="stretch"
            >

                <Grid
                    size={{
                        xs: 12,
                        md: 6
                    }}
                    sx={{
                        display: "flex"
                    }}
                >

                    <Paper
                        sx={{
                            p: 3,
                            width: "100%",
                            minHeight: 300,
                            display: "flex",
                            flexDirection: "column"
                        }}
                    >

                        <Typography
                            variant="h6"
                            sx={{ mb: 1 }}
                        >
                            Periodo
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 3 }}
                        >
                            Selecciona el mes para consultar
                            las ventas pendientes por facturar.
                        </Typography>

                        <LocalizationProvider
                            dateAdapter={AdapterDayjs}
                            adapterLocale="es"
                        >

                            <DatePicker
                                label="Mes / Año"
                                views={[
                                    "month",
                                    "year"
                                ]}
                                value={selectedDate}
                                onChange={(value) => {

                                    if (value) {

                                        setSelectedDate(
                                            value
                                        );
                                    }
                                }}
                                sx={{
                                    width: "100%",
                                    maxWidth: 320
                                }}
                            />

                        </LocalizationProvider>

                    </Paper>

                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        md: 6
                    }}
                    sx={{
                        display: "flex"
                    }}
                >

                    <Paper
                        sx={{
                            p: 3,
                            width: "100%",
                            minHeight: 300,
                            display: "flex",
                            flexDirection: "column"
                        }}
                    >

                        <Typography
                            variant="h6"
                            sx={{ mb: 2 }}
                        >
                            Pendientes por facturar
                        </Typography>

                        {
                            pending?.ventas > 0

                                ? (

                                    <>

                                        <Chip
                                            label={
                                                `${pending.ventas} venta(s) pendiente(s)`
                                            }
                                            color="error"
                                            size="small"
                                            sx={{
                                                alignSelf:
                                                    "flex-start",
                                                mb: 3
                                            }}
                                        />

                                        <Grid
                                            container
                                            spacing={3}
                                        >

                                            <Grid
                                                size={{
                                                    xs: 6,
                                                    md: 4
                                                }}
                                            >
                                                <Metric
                                                    label="Subtotal"
                                                    value={
                                                        formatMoney(
                                                            pending.subtotal
                                                        )
                                                    }
                                                />
                                            </Grid>

                                            <Grid
                                                size={{
                                                    xs: 6,
                                                    md: 4
                                                }}
                                            >
                                                <Metric
                                                    label="IVA"
                                                    value={
                                                        formatMoney(
                                                            pending.iva
                                                        )
                                                    }
                                                />
                                            </Grid>

                                            <Grid
                                                size={{
                                                    xs: 12,
                                                    md: 4
                                                }}
                                            >
                                                <Metric
                                                    label="Total pendiente"
                                                    value={
                                                        formatMoney(
                                                            pending.total
                                                        )
                                                    }
                                                    emphasis
                                                />
                                            </Grid>

                                        </Grid>

                                        <Divider
                                            sx={{
                                                mt: "auto",
                                                mb: 2
                                            }}
                                        />

                                        <Stack
                                            direction={{
                                                xs: "column",
                                                sm: "row"
                                            }}
                                            spacing={2}
                                        >

                                            <Button
                                                variant="outlined"
                                                onClick={
                                                    downloadCsv
                                                }
                                            >
                                                Exportar CSV
                                            </Button>

                                            <Button
                                                variant="contained"
                                                color="success"
                                                onClick={
                                                    handleMarkAsInvoiced
                                                }
                                            >
                                                Marcar facturadas
                                            </Button>

                                        </Stack>

                                    </>

                                )

                                : (

                                    <>

                                        <Chip
                                            label="Todo facturado"
                                            color="success"
                                            size="small"
                                            sx={{
                                                alignSelf:
                                                    "flex-start"
                                            }}
                                        />

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mt: 2 }}
                                        >
                                            No hay ventas pendientes
                                            para el periodo seleccionado.
                                        </Typography>

                                    </>

                                )
                        }

                    </Paper>

                </Grid>

            </Grid>

            {/* TABLA SOLO CUANDO EXISTEN PENDIENTES */}

            {
                pendingSales.length > 0 && (

                    <Paper>

                        <Stack
                            sx={{
                                px: 3,
                                pt: 3,
                                pb: 1
                            }}
                        >

                            <Typography
                                variant="h6"
                            >
                                Detalle de ventas pendientes
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {
                                    pendingSales.length
                                } venta(s) del periodo seleccionado
                            </Typography>

                        </Stack>

                        <TableContainer>

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
                                            Método de pago
                                        </TableCell>

                                        <TableCell
                                            align="right"
                                        >
                                            Subtotal
                                        </TableCell>

                                        <TableCell
                                            align="right"
                                        >
                                            IVA
                                        </TableCell>

                                        <TableCell
                                            align="right"
                                        >
                                            Total
                                        </TableCell>

                                    </TableRow>

                                </TableHead>

                                <TableBody>

                                    {
                                        pendingSales.map(
                                            (sale) => (

                                                <TableRow
                                                    key={
                                                        sale.ventaId
                                                    }
                                                    hover
                                                >

                                                    <TableCell>
                                                        #{sale.ventaId}
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            new Date(
                                                                sale.fecha
                                                            )
                                                                .toLocaleDateString(
                                                                    "es-MX"
                                                                )
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            sale.canalVenta
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            sale.metodoPago
                                                        }
                                                    </TableCell>

                                                    <TableCell
                                                        align="right"
                                                    >
                                                        {
                                                            formatMoney(
                                                                sale.subtotal
                                                            )
                                                        }
                                                    </TableCell>

                                                    <TableCell
                                                        align="right"
                                                    >
                                                        {
                                                            formatMoney(
                                                                sale.iva
                                                            )
                                                        }
                                                    </TableCell>

                                                    <TableCell
                                                        align="right"
                                                    >
                                                        {
                                                            formatMoney(
                                                                sale.total
                                                            )
                                                        }
                                                    </TableCell>

                                                </TableRow>

                                            )
                                        )
                                    }

                                </TableBody>

                            </Table>

                        </TableContainer>

                    </Paper>

                )
            }

        </Stack>

    );
}

export default Reports;
