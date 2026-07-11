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
    DialogContent
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
    getSales,
    getSaleDetails
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

    const [openDetail,
        setOpenDetail] =
        useState(false);

    const [saleDetails,
        setSaleDetails] =
        useState([]);

    const [selectedSaleId,
        setSelectedSaleId] =
        useState(null);

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

                                <TableCell>
    Acciones
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
                            }

                        </TableBody>

                    </Table>

                </TableContainer>

            </Paper>
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