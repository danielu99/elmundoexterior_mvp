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
    TableRow
} from "@mui/material";

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
    getSales
} from "../services/saleService";

import {formatCurrency} from "../utils/formatters";

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
                    
                    getSales()

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

                setSales(
                    salesData
                );

            } catch (error) {

                console.error(error);

            }
        };

    useEffect(() => {

        loadData();

    }, []);

    return (

        <Container
            sx={{ mt: 4 }}>

            <Typography
                variant="h4"
                gutterBottom>

                Ventas

            </Typography>

            <SaleForm
                products={
                    products
                }
                paymentMethods={
                    paymentMethods
                }
                salesChannels={
                    salesChannels
                }
                onSaleCreated={
                    loadData
                }
            />
            <Paper sx={{ mt: 4 }}>

                <Typography
                    variant="h6"
                    sx={{ p: 2 }}
                >

                    Ventas Registradas

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

                            </TableRow>

                        </TableHead>

                        <TableBody>

                            {
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
                                                        ? "Sí"
                                                        : "No"
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

                                        </TableRow>

                                    )
                                )
                            }

                        </TableBody>

                    </Table>

                </TableContainer>

            </Paper>

        </Container>

    );
}

export default Sales;