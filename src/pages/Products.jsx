import { useEffect, useState } from "react";

import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from "@mui/material";

import { getProducts } from "../services/productService";
import ProductForm from "../components/ProductForm";

function Products() {

    const [products, setProducts] = useState([]);

    const loadProducts = async () => {

        try {

            const data = await getProducts();

            setProducts(data);

        } catch (error) {

            console.error(error);

        }
    };

    useEffect(() => {

        loadProducts();

    }, []);

    return (

        <Container sx={{ mt: 4 }}>

            <Typography
                variant="h4"
                gutterBottom>

                Productos

            </Typography>

            <ProductForm
                onProductCreated={loadProducts}
            />

            <TableContainer component={Paper}>

                <Table>

                    <TableHead>

                        <TableRow>

                            <TableCell>ID</TableCell>

                            <TableCell>SKU</TableCell>

                            <TableCell>Nombre</TableCell>

                            <TableCell>Costo Promedio</TableCell>

                            <TableCell>Margen</TableCell>

                            <TableCell>Precio Final</TableCell>

                            <TableCell>Stock</TableCell>

                        </TableRow>

                    </TableHead>

                    <TableBody>

                        {products.map((product) => (

                            <TableRow key={product.id}>

                                <TableCell>
                                    {product.id}
                                </TableCell>

                                <TableCell>
                                    {product.sku}
                                </TableCell>

                                <TableCell>
                                    {product.nombre}
                                </TableCell>

                                <TableCell>
                                    $
                                    {Number(
                                        product.costoPromedio
                                    ).toFixed(2)}
                                </TableCell>

                                <TableCell>
                                    {product.margenDeseado * 100}%
                                </TableCell>

                                <TableCell>
                                    $
                                    {Number(
                                        product.precioFinal
                                    ).toFixed(2)}
                                </TableCell>

                                <TableCell>
                                    {product.stockActual}
                                </TableCell>

                            </TableRow>

                        ))}

                    </TableBody>

                </Table>

            </TableContainer>

        </Container>

    );
}

export default Products;