import { useState } from "react";

import {
    TextField,
    Button,
    Paper,
    Stack,
    Typography,
    Checkbox,
    FormControlLabel
} from "@mui/material";

import { createProduct } from "../services/productService";

function ProductForm({ onProductCreated }) {

    const [form, setForm] = useState({
        sku: "",
        nombre: "",
        cantidadInicial: "",
        costoUnitario: "",
        margenDeseado: "",
        precioFinal: "",
        compraFacturada: false
    });

    const handleChange = (event) => {

        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    };

    const costoCapturado =
        Number(form.costoUnitario) || 0;

    const margen =
        Number(form.margenDeseado) || 0;

    const costoReal =
        form.compraFacturada
            ? costoCapturado / 1.16
            : costoCapturado;

    const precioSugerido =
        costoReal > 0 && margen < 100
            ? (costoReal / (1 - margen / 100)) * 1.16
            : 0;

    const handleSubmit = async (event) => {

        event.preventDefault();

        try {

            await createProduct({
                sku: form.sku,
                nombre: form.nombre,
                cantidadInicial:
                    Number(form.cantidadInicial),
                costoUnitario:
                    Number(form.costoUnitario),
                margenDeseado:
                    Number(form.margenDeseado),
                precioFinal:
                    Number(form.precioFinal),
                compraFacturada:
                    form.compraFacturada
            });

            setForm({
                sku: "",
                nombre: "",
                cantidadInicial: "",
                costoUnitario: "",
                margenDeseado: "",
                precioFinal: "",
                compraFacturada: false
            });

            onProductCreated();

        } catch (error) {

            console.error(error);

        }
    };

    return (

        <Paper sx={{ p: 3, mb: 3 }}>

            <Typography
                variant="h6"
                gutterBottom>

                Nuevo Producto

            </Typography>

            <form onSubmit={handleSubmit}>

                <Stack spacing={2}>

                    <TextField
                        label="SKU"
                        name="sku"
                        value={form.sku}
                        onChange={handleChange}
                        required
                    />

                    <TextField
                        label="Nombre"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        required
                    />

                    <TextField
                        label="Cantidad Inicial"
                        name="cantidadInicial"
                        type="number"
                        value={form.cantidadInicial}
                        onChange={handleChange}
                        required
                    />

                    <TextField
                        label="Costo Unitario"
                        name="costoUnitario"
                        type="number"
                        value={form.costoUnitario}
                        onChange={handleChange}
                        required
                    />

                    <TextField
                        label="Margen Deseado (%)"
                        name="margenDeseado"
                        type="number"
                        value={form.margenDeseado}
                        onChange={handleChange}
                        required
                    />

                    <TextField
                        label={
                            <>
                                Precio Sugerido{" "}
                                <span style={{ color: "gray" }}>
                                    (IVA incluido)
                                </span>
                            </>
                        }
                        value={precioSugerido.toFixed(2)}
                        disabled
                        sx={{
                            "& .MuiInputLabel-root.Mui-disabled": {
                                color: "black"
                            },
                            "& .MuiInputLabel-root.Mui-disabled span": {
                                color: "gray"
                            }
                        }}
                    />

                    <TextField
                        label="Precio Final"
                        name="precioFinal"
                        type="number"
                        value={form.precioFinal}
                        onChange={handleChange}
                        required
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={
                                    form.compraFacturada
                                }
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        compraFacturada:
                                            event.target.checked
                                    })
                                }
                            />
                        }
                        label="La compra tiene factura"
                    />

                    {
                        form.compraFacturada &&
                        costoCapturado > 0 && (

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Costo real sin IVA: $
                                {costoReal.toFixed(2)}
                            </Typography>

                        )
                    }

                    <Button
                        type="submit"
                        variant="contained">

                        Guardar

                    </Button>

                </Stack>

            </form>

        </Paper>

    );
}

export default ProductForm;