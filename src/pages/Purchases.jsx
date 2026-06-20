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

import PurchaseForm
    from "../components/PurchaseForm";

import {
    getProducts
} from "../services/productService";

import {
    getPurchases
} from "../services/purchaseService";

import {formatCurrency} from "../utils/formatters";

function Purchases() {

    const [products,
        setProducts] =
        useState([]);

    const [purchases,
        setPurchases] =
        useState([]);

    const loadData =
        async () => {

            try {

                const [
                    productsData,
                    purchasesData
                ] = await Promise.all([

                    getProducts(),

                    getPurchases()

                ]);

                setProducts(
                    productsData
                );

                setPurchases(
                    purchasesData
                );

            } catch (error) {

                console.error(
                    error
                );

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

                Compras

            </Typography>

            <PurchaseForm
                products={
                    products
                }
                onPurchaseCreated={
                    loadData
                }
            />
            <Paper sx={{ mt: 4 }}>

                <Typography
                    variant="h6"
                    sx={{ p: 2 }}
                >

                    Compras Registradas

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
                                    Producto
                                </TableCell>

                                <TableCell align="right">
                                    Cantidad
                                </TableCell>

                                <TableCell>
                                    Facturada
                                </TableCell>

                                <TableCell align="right">
                                    Costo Capturado
                                </TableCell>

                                <TableCell align="right">
                                    Costo Real
                                </TableCell>

                            </TableRow>

                        </TableHead>

                        <TableBody>

                            {
                                [...purchases]
                                .sort(
                                    (a, b) =>
                                        new Date(b.fecha) -
                                        new Date(a.fecha)
                                )
                                .map(
                                    (purchase) => (

                                        <TableRow
                                            key={purchase.id}
                                        >

                                            <TableCell>
                                                #{purchase.id}
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    new Date(
                                                        purchase.fecha
                                                    ).toLocaleDateString()
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    purchase.productName
                                                }
                                            </TableCell>

                                            <TableCell
                                                align="right"
                                            >
                                                {
                                                    purchase.cantidad
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    purchase.facturada
                                                        ? "Sí"
                                                        : "No"
                                                }
                                            </TableCell>

                                            <TableCell
                                                align="right"
                                            >
                                                {
                                                    formatCurrency(
                                                        purchase.costoUnitario
                                                    )
                                                }
                                            </TableCell>

                                            <TableCell
                                                align="right"
                                            >
                                                {
                                                    formatCurrency(
                                                        purchase.costoReal
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

export default Purchases;