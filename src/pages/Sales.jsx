import {
    useEffect,
    useState
} from "react";

import {
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Chip
} from "@mui/material";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import dayjs from "dayjs";
import "dayjs/locale/es";

import {
    LocalizationProvider
} from "@mui/x-date-pickers";

import {
    AdapterDayjs
} from "@mui/x-date-pickers/AdapterDayjs";

import {
    DatePicker
} from "@mui/x-date-pickers/DatePicker";


import SaleForm
    from "../components/SaleForm";

import {
    getProducts
} from "../services/productService";

import {
    getPaymentMethods
} from "../services/paymentMethodService";

import {
    getSalesChannels
} from "../services/salesChannelService";

import {
    getSales,
    getSaleDetails,
    getSalesByDateRange
} from "../services/saleService";

import { formatCurrency } from "../utils/formatters";

function Sales() {

    const [products,
        setProducts] =
        useState([]);

    const [paymentMethods,
        setPaymentMethods] =
        useState([]);

    const [salesChannels,
        setSalesChannels] =
        useState([]);

    const [sales,
        setSales] =
        useState([]);

    const [openDetail,
        setOpenDetail] =
        useState(false);

    const [saleDetails,
        setSaleDetails] =
        useState([]);

    const [selectedSaleId,
        setSelectedSaleId] =
        useState(null);

    const [tab,
        setTab] =
        useState(0);

    const [fromDate,
        setFromDate] =
        useState(
            dayjs()
                .startOf("month")
        );

    const [toDate,
        setToDate] =
        useState(
            dayjs()
        );

    const loadData =
        async () => {

            try {

                const [
                    productsData,
                    paymentMethodsData,
                    salesChannelsData,
                    salesData
                ] = await Promise.all([

                    getProducts(),

                    getPaymentMethods(),

                    getSalesChannels(),

                ]);

                setProducts(
                    productsData
                );

                setPaymentMethods(
                    paymentMethodsData
                );

                setSalesChannels(
                    salesChannelsData
                );

            } catch (error) {

                console.error(error);

            }
        };

    const searchSales =
        async () => {

            try {

                const data =
                    await getSalesByDateRange(
                        fromDate.format(
                            "YYYY-MM-DD"
                        ),
                        toDate.format(
                            "YYYY-MM-DD"
                        )
                    );

                setSales(data);

            } catch (error) {

                console.error(error);

            }
        };

    const handleViewDetail =
        async (saleId) => {

            try {

                const data =
                    await getSaleDetails(
                        saleId
                    );

                setSaleDetails(
                    data
                );

                setSelectedSaleId(
                    saleId
                );

                setOpenDetail(
                    true
                );

            } catch (error) {

                console.error(error);

            }
        };

    useEffect(() => {

        loadData();

    }, []);

    useEffect(
        () => {

            if (tab === 1) {

                searchSales();

            }

        },
        [tab]
    );

    return (

        <Container
            sx={{ mt: 4 }}>

            <Typography
                variant="h4"
                gutterBottom>

                Ventas

            </Typography>

            <Tabs
                value={tab}
                onChange={(event, value) =>
                    setTab(value)
                }
                sx={{ mb: 3 }}
            >

                <Tab
                    label="Nueva Venta"
                />

                <Tab
                    label="Historial"
                />

            </Tabs>

            {
                tab === 0 && (

                    <SaleForm
                        products={products}
                        paymentMethods={paymentMethods}
                        salesChannels={salesChannels}
                        onSaleCreated={loadData}
                    />

                )
            }

            {
                tab === 1 && (

                    <LocalizationProvider
                        dateAdapter={AdapterDayjs}
                        adapterLocale="es"
                    >

                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                mb: 2
                            }}
                        >

                            <DatePicker
                                label="Desde"
                                value={fromDate}
                                onChange={setFromDate}
                            />

                            <DatePicker
                                label="Hasta"
                                value={toDate}
                                onChange={setToDate}
                            />

                            <Button
                                variant="contained"
                                onClick={
                                    searchSales
                                }
                            >
                                Buscar
                            </Button>

                        </Box>


                        <Paper sx={{ mt: 2 }}>

                            <Typography
                                variant="h6"
                                sx={{ p: 2 }}
                            >

                                Ventas Registradas

                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    px: 2,
                                    pb: 1
                                }}
                            >

                                Mostrando {sales.length} venta(s)

                            </Typography>
                            <TableContainer>

                                <Table>

                                    <TableHead>

                                        <TableRow>

                                            <TableCell>
                                                ID
                                            </TableCell>

                                            <TableCell>
                                                Fecha
                                            </TableCell>

                                            <TableCell>
                                                Facturada
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

                                            <TableCell>
                                                Acciones
                                            </TableCell>

                                        </TableRow>

                                    </TableHead>

                                    <TableBody>

                                        {
                                            sales.length === 0

                                                ? (

                                                    <TableRow>

                                                        <TableCell
                                                            colSpan={7}
                                                            align="center"
                                                            sx={{
                                                                py: 6
                                                            }}
                                                        >

                                                            <Typography
                                                                variant="body1"
                                                                color="text.secondary"
                                                            >

                                                                No se encontraron ventas
                                                                para el rango seleccionado

                                                            </Typography>

                                                        </TableCell>

                                                    </TableRow>

                                                )

                                                : (

                                                    [...sales]
                                                        .sort(
                                                            (a, b) =>
                                                                new Date(b.fecha) -
                                                                new Date(a.fecha)
                                                        )
                                                        .map(
                                                            (sale) => (

                                                                <TableRow
                                                                    key={sale.id}
                                                                >

                                                                    <TableCell>
                                                                        #{sale.id}
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        {
                                                                            new Date(
                                                                                sale.fecha
                                                                            ).toLocaleDateString()
                                                                        }
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        {
                                                                            sale.facturada
                                                                                ? <Chip
                                                                                    label="Facturada"
                                                                                    color="success"
                                                                                    size="small"
                                                                                />
                                                                                : <Chip
                                                                                    label="Pendiente"
                                                                                    color="warning"
                                                                                    size="small"
                                                                                />
                                                                        }
                                                                    </TableCell>

                                                                    <TableCell align="right">
                                                                        {
                                                                            formatCurrency(
                                                                                sale.subtotal
                                                                            )
                                                                        }
                                                                    </TableCell>

                                                                    <TableCell align="right">
                                                                        {
                                                                            formatCurrency(
                                                                                sale.iva
                                                                            )
                                                                        }
                                                                    </TableCell>

                                                                    <TableCell align="right">
                                                                        {
                                                                            formatCurrency(
                                                                                sale.total
                                                                            )
                                                                        }
                                                                    </TableCell>

                                                                    <TableCell>

                                                                        <Button
                                                                            size="small"
                                                                            variant="outlined"
                                                                            onClick={() =>
                                                                                handleViewDetail(
                                                                                    sale.id
                                                                                )
                                                                            }
                                                                        >
                                                                            Ver detalle
                                                                        </Button>

                                                                    </TableCell>

                                                                </TableRow>

                                                            )
                                                        )

                                                )
                                        }

                                    </TableBody>

                                </Table>

                            </TableContainer>

                        </Paper>
                    </LocalizationProvider>


                )
            }
            <Dialog
                open={openDetail}
                onClose={() =>
                    setOpenDetail(false)
                }
                maxWidth="md"
                fullWidth
            >

                <DialogTitle>

                    Venta #{selectedSaleId}

                </DialogTitle>

                <DialogContent>

                    <Table>

                        <TableHead>

                            <TableRow>

                                <TableCell>
                                    Producto
                                </TableCell>

                                <TableCell align="right">
                                    Cantidad
                                </TableCell>

                                <TableCell align="right">
                                    Precio Unitario
                                </TableCell>

                                <TableCell align="right">
                                    Subtotal
                                </TableCell>

                            </TableRow>

                        </TableHead>

                        <TableBody>

                            {
                                saleDetails.map(
                                    detail => (

                                        <TableRow
                                            key={
                                                detail.producto
                                            }
                                        >

                                            <TableCell>
                                                {
                                                    detail.producto
                                                }
                                            </TableCell>

                                            <TableCell align="right">
                                                {
                                                    detail.cantidad
                                                }
                                            </TableCell>

                                            <TableCell align="right">
                                                {
                                                    formatCurrency(
                                                        detail.precioUnitario
                                                    )
                                                }
                                            </TableCell>

                                            <TableCell align="right">
                                                {
                                                    formatCurrency(
                                                        detail.subtotal
                                                    )
                                                }
                                            </TableCell>

                                        </TableRow>

                                    )
                                )
                            }

                        </TableBody>

                    </Table>

                </DialogContent>

            </Dialog>

        </Container>

    );
}

export default Sales;