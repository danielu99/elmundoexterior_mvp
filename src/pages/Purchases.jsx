import {
    useEffect,
    useState
} from "react";

import {
    Container,
    Typography
} from "@mui/material";

import PurchaseForm
    from "../components/PurchaseForm";

import {
    getProducts
} from "../services/productService";

function Purchases() {

    const [products,
        setProducts] =
        useState([]);

    const loadProducts =
        async () => {

            try {

                const data =
                    await getProducts();

                setProducts(
                    data
                );

            } catch (error) {

                console.error(
                    error
                );

            }
        };

    useEffect(() => {

        loadProducts();

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
                    loadProducts
                }
            />

        </Container>
    );
}

export default Purchases;