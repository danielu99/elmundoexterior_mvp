import { useState } from "react";

import {
    Paper,
    Stack,
    TextField,
    Button,
    Typography,
    Checkbox,
    FormControlLabel,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from "@mui/material";

import { createSale } from "../services/saleService";

function SaleForm({
    products,
    paymentMethods,
    salesChannels,
    onSaleCreated
}) {

    const [sale, setSale] = useState({
        salesChannelId: "",
        paymentMethodId: "",
        facturada: false
    });

    const [item, setItem] = useState({
        productId: "",
        cantidad: 1,
        precioUnitario: ""
    });

    const [items, setItems] = useState([]);

    const handleProductChange = (event) => {

        const productId =
            Number(event.target.value);

        const product =
            products.find(
                p => p.id === productId
            );

        setItem({
            productId,
            cantidad: 1,
            precioUnitario:
                product?.precioFinal ?? ""
        });
    };

    const addItem = () => {

        const selectedProduct =
            products.find(
                p => p.id === item.productId
            );

        if (!selectedProduct) {
            return;
        }

        if (
            item.cantidad >
            selectedProduct.stockActual
        ) {

            alert(
                "No hay suficiente stock"
            );

            return;
        }

        setItems([
            ...items,
            {
                ...item
            }
        ]);

        setItem({
            productId: "",
            cantidad: 1,
            precioUnitario: ""
        });
    };

    const total =
        items.reduce(
            (acc, item) =>
                acc +
                (
                    item.cantidad *
                    item.precioUnitario
                ),
            0
        );

    const subtotal =
        total / 1.16;

    const iva =
        total - subtotal;

    const handleSubmit =
        async (event) => {

            event.preventDefault();

            try {

                await createSale({

                    idCanalVenta:
                        Number(
                            sale.salesChannelId
                        ),

                    idMetodoPago:
                        Number(
                            sale.paymentMethodId
                        ),

                    facturada:
                        sale.facturada,

                    items
                });

                setSale({
                    salesChannelId: "",
                    paymentMethodId: "",
                    facturada: false
                });

                setItems([]);

                onSaleCreated();

            } catch (error) {

                console.error(error);

            }
        };

    return (

        <Paper sx={{ p: 3 }}>

            <Typography
                variant="h6"
                gutterBottom>

                Nueva Venta

            </Typography>

            <form
                onSubmit={
                    handleSubmit
                }>

                <Stack spacing={2}>

                    <TextField
                        select
                        label="Canal de Venta"
                        value={
                            sale.salesChannelId
                        }
                        onChange={(event) =>
                            setSale({
                                ...sale,
                                salesChannelId:
                                    event.target.value
                            })
                        }
                    >

                        {salesChannels.map(
                            channel => (

                            <MenuItem
                                key={channel.id}
                                value={channel.id}
                            >

                                {channel.nombre}

                            </MenuItem>

                        ))}

                    </TextField>

                    <TextField
                        select
                        label="Método de Pago"
                        value={
                            sale.paymentMethodId
                        }
                        onChange={(event) =>
                            setSale({
                                ...sale,
                                paymentMethodId:
                                    event.target.value
                            })
                        }
                    >

                        {paymentMethods.map(
                            method => (

                            <MenuItem
                                key={method.id}
                                value={method.id}
                            >

                                {method.nombre}

                            </MenuItem>

                        ))}

                    </TextField>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={
                                    sale.facturada
                                }
                                onChange={(event) =>
                                    setSale({
                                        ...sale,
                                        facturada:
                                            event.target.checked
                                    })
                                }
                            />
                        }
                        label="Venta Facturada"
                    />

                    <Typography
                        variant="subtitle1">

                        Agregar Producto

                    </Typography>

                    <TextField
                        select
                        label="Producto"
                        value={
                            item.productId
                        }
                        onChange={
                            handleProductChange
                        }
                    >

                        {products.map(
                            product => (

                            <MenuItem
                                key={product.id}
                                value={product.id}
                            >

                                {product.nombre}

                            </MenuItem>

                        ))}

                    </TextField>

                    <Typography
                        variant="body2">

                        Stock disponible: {
                            products.find(
                                p =>
                                    p.id ===
                                    item.productId
                            )?.stockActual ?? 0
                        }

                    </Typography>

                    <TextField
                        label="Cantidad"
                        type="number"
                        value={
                            item.cantidad
                        }
                        onChange={(event) =>
                            setItem({
                                ...item,
                                cantidad:
                                    Number(
                                        event.target.value
                                    )
                            })
                        }
                    />

                    <TextField
                        label="Precio Unitario"
                        type="number"
                        value={
                            item.precioUnitario
                        }
                        onChange={(event) =>
                            setItem({
                                ...item,
                                precioUnitario:
                                    Number(
                                        event.target.value
                                    )
                            })
                        }
                    />

                    <Button
                        variant="outlined"
                        onClick={
                            addItem
                        }
                    >

                        Agregar Producto

                    </Button>

                    <Table>

                        <TableHead>

                            <TableRow>

                                <TableCell>
                                    Producto
                                </TableCell>

                                <TableCell>
                                    Cantidad
                                </TableCell>

                                <TableCell>
                                    Precio
                                </TableCell>

                            </TableRow>

                        </TableHead>

                        <TableBody>

                            {items.map(
                                (
                                    item,
                                    index
                                ) => {

                                    const product =
                                        products.find(
                                            p =>
                                                p.id ===
                                                item.productId
                                        );

                                    return (

                                        <TableRow
                                            key={
                                                index
                                            }
                                        >

                                            <TableCell>

                                                {
                                                    product?.nombre
                                                }

                                            </TableCell>

                                            <TableCell>

                                                {
                                                    item.cantidad
                                                }

                                            </TableCell>

                                            <TableCell>

                                                {
                                                    item.precioUnitario
                                                }

                                            </TableCell>

                                        </TableRow>

                                    );
                                }
                            )}

                        </TableBody>

                    </Table>

                    <Typography>

                        Subtotal:
                        {" "}
                        ${subtotal.toFixed(2)}

                    </Typography>

                    <Typography>

                        IVA:
                        {" "}
                        ${iva.toFixed(2)}

                    </Typography>

                    <Typography>

                        Total:
                        {" "}
                        ${total.toFixed(2)}

                    </Typography>

                    <Button
                        type="submit"
                        variant="contained"
                    >

                        Guardar Venta

                    </Button>

                </Stack>

            </form>

        </Paper>
    );
}

export default SaleForm;