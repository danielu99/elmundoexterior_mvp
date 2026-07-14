import { useState } from "react";

import {
    Paper,
    Stack,
    TextField,
    Button,
    Typography,
    Checkbox,
    FormControlLabel,
    MenuItem
} from "@mui/material";

import {
    createPurchase
} from "../services/purchaseService";

function PurchaseForm({
    products,
    onPurchaseCreated
}) {

    const [form, setForm] =
        useState({
            productId: "",
            cantidad: "",
            costoUnitario: "",
            facturada: false
        });

    const handleChange =
        (event) => {

            setForm({
                ...form,
                [event.target.name]:
                    event.target.value
            });
        };

    const handleSubmit =
        async (event) => {

            event.preventDefault();

            try {

                await createPurchase({

                    productId:
                        Number(
                            form.productId
                        ),

                    cantidad:
                        Number(
                            form.cantidad
                        ),

                    costoUnitario:
                        Number(
                            form.costoUnitario
                        ),

                    facturada:
                        form.facturada
                });

                setForm({

                    productId: "",
                    cantidad: "",
                    costoUnitario: "",
                    facturada: false
                });

                onPurchaseCreated();

            } catch (error) {

                console.error(error);

            }
        };

    return (

        <Paper sx={{ p: 3, mb: 3 }}>

            <Typography
                variant="h6"
                gutterBottom>

                Nueva Compra

            </Typography>

            <form
                onSubmit={
                    handleSubmit
                }>

                <Stack spacing={2}>

                    <TextField
                        select
                        label="Producto"
                        name="productId"
                        value={
                            form.productId
                        }
                        onChange={
                            handleChange
                        }
                        required
                    >

                        {products.map(
                            product => (

                                <MenuItem
                                    key={
                                        product.id
                                    }
                                    value={
                                        product.id
                                    }
                                >

                                    {
                                        product.nombre
                                    }

                                </MenuItem>

                            ))}

                    </TextField>

                    <TextField
                        label="Cantidad"
                        name="cantidad"
                        type="number"
                        value={
                            form.cantidad
                        }
                        onChange={
                            handleChange
                        }
                        required
                    />

                    <TextField
                        label="Costo Unitario"
                        name="costoUnitario"
                        type="number"
                        value={
                            form.costoUnitario
                        }
                        onChange={
                            handleChange
                        }
                        required
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={
                                    form.facturada
                                }
                                onChange={
                                    (
                                        event
                                    ) =>
                                        setForm({
                                            ...form,
                                            facturada:
                                                event
                                                    .target
                                                    .checked
                                        })
                                }
                            />
                        }
                        label="Compra Facturada"
                    />

                    <Button
                        type="submit"
                        variant="contained"
                    >

                        Guardar Compra

                    </Button>

                </Stack>

            </form>

        </Paper>
    );
}

export default PurchaseForm;