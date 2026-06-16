import {
    useEffect,
    useState
} from "react";

import {
    Container,
    Typography
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

    const loadData =
        async () => {

            try {

                const [
                    productsData,
                    paymentMethodsData,
                    salesChannelsData
                ] = await Promise.all([

                    getProducts(),

                    getPaymentMethods(),

                    getSalesChannels()

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

        </Container>

    );
}

export default Sales;