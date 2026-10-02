import { useState } from "react";

import {
    Alert,
    Autocomplete,
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

import DeleteIcon
    from "@mui/icons-material/Delete";

import { createSale }
    from "../services/saleService";

import api
    from "../services/api";

import BarcodeScanner
    from "./BarcodeScanner";


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

    const [scannerOpen, setScannerOpen] =
        useState(false);

    const [scanMessage, setScanMessage] =
        useState("");

    const [scanError, setScanError] =
        useState("");


    /*
     * Selección manual de producto.
     *
     * Se utiliza desde el Autocomplete.
     */
    const selectProduct = (product) => {

        if (!product) {

            setItem({
                productId: "",
                cantidad: 1,
                precioUnitario: ""
            });

            return;
        }

        setItem({
            productId: product.id,
            cantidad: 1,
            precioUnitario:
                product.precioFinal ?? ""
        });
    };


    /*
     * Agregar producto manualmente.
     */
    const addItem = () => {

        const selectedProduct =
            products.find(
                product =>
                    product.id ===
                    item.productId
            );

        if (!selectedProduct) {
            return;
        }

        /*
         * Revisamos si el producto ya está
         * agregado a la venta.
         */
        const existingItem =
            items.find(
                currentItem =>
                    currentItem.productId ===
                    selectedProduct.id
            );

        /*
         * Si ya existe, incrementamos
         * su cantidad.
         */
        if (existingItem) {

            const newQuantity =
                existingItem.cantidad +
                item.cantidad;

            if (
                newQuantity >
                selectedProduct.stockActual
            ) {

                alert(
                    "No hay suficiente stock"
                );

                return;
            }

            setItems(
                currentItems =>
                    currentItems.map(
                        currentItem =>
                            currentItem.productId ===
                            selectedProduct.id

                                ? {
                                    ...currentItem,
                                    cantidad:
                                        newQuantity,
                                    precioUnitario:
                                        item.precioUnitario
                                }

                                : currentItem
                    )
            );

        } else {

            /*
             * Producto nuevo en la venta.
             */
            if (
                item.cantidad >
                selectedProduct.stockActual
            ) {

                alert(
                    "No hay suficiente stock"
                );

                return;
            }

            setItems(
                currentItems => [
                    ...currentItems,
                    {
                        ...item
                    }
                ]
            );
        }

        /*
         * Limpiamos selección.
         */
        setItem({
            productId: "",
            cantidad: 1,
            precioUnitario: ""
        });
    };


    /*
     * Código detectado por la cámara.
     */
    const handleBarcodeDetected =
        async (code) => {

            setScannerOpen(false);

            setScanError("");
            setScanMessage("");

            try {

                /*
                 * Buscamos el producto
                 * directamente por barcode.
                 */
                const response =
                    await api.get(
                        `/products/barcode/${
                            encodeURIComponent(code)
                        }`
                    );

                const product =
                    response.data;

                /*
                 * ¿Ya está agregado?
                 */
                const existingItem =
                    items.find(
                        currentItem =>
                            currentItem.productId ===
                            product.id
                    );

                /*
                 * Si ya existe:
                 * incrementamos cantidad.
                 */
                if (existingItem) {

                    const newQuantity =
                        existingItem.cantidad + 1;

                    if (
                        newQuantity >
                        product.stockActual
                    ) {

                        setScanError(
                            `No hay más stock disponible de ${product.nombre}.`
                        );

                        return;
                    }

                    setItems(
                        currentItems =>
                            currentItems.map(
                                currentItem =>
                                    currentItem.productId ===
                                    product.id

                                        ? {
                                            ...currentItem,
                                            cantidad:
                                                newQuantity
                                        }

                                        : currentItem
                            )
                    );

                    setScanMessage(
                        `${product.nombre}: cantidad aumentada a ${newQuantity}.`
                    );

                    return;
                }

                /*
                 * Primera vez que aparece
                 * el producto en la venta.
                 */
                if (
                    product.stockActual <= 0
                ) {

                    setScanError(
                        `${product.nombre} no tiene stock disponible.`
                    );

                    return;
                }

                setItems(
                    currentItems => [
                        ...currentItems,
                        {
                            productId:
                                product.id,
                            cantidad: 1,
                            precioUnitario:
                                product.precioFinal
                        }
                    ]
                );

                setScanMessage(
                    `${product.nombre} agregado a la venta.`
                );

            } catch (error) {

                console.error(error);

                if (
                    error.response?.status ===
                    404
                ) {

                    setScanError(
                        `Código ${code}: producto no registrado.`
                    );

                } else {

                    setScanError(
                        "No fue posible buscar el producto."
                    );
                }
            }
        };


    const removeItem =
        (index) => {

            setItems(
                items.filter(
                    (_, i) =>
                        i !== index
                )
            );
        };


    const clearSale =
        () => {

            const confirmed =
                window.confirm(
                    "¿Deseas eliminar todos los productos de la venta?"
                );

            if (!confirmed) {
                return;
            }

            setItems([]);

            setItem({
                productId: "",
                cantidad: 1,
                precioUnitario: ""
            });

            setScanMessage("");
            setScanError("");
        };


    const total =
        items.reduce(
            (acc, currentItem) =>
                acc +
                (
                    currentItem.cantidad *
                    currentItem.precioUnitario
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

                setItem({
                    productId: "",
                    cantidad: 1,
                    precioUnitario: ""
                });

                setScanMessage("");
                setScanError("");

                onSaleCreated();

            } catch (error) {

                console.error(error);
            }
        };


    return (

        <Paper sx={{ p: 3 }}>

            <Typography
                variant="h6"
                gutterBottom
            >
                Nueva Venta
            </Typography>


            <form
                onSubmit={
                    handleSubmit
                }
            >

                <Stack spacing={2}>

                    {/* CANAL DE VENTA */}

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

                        {
                            salesChannels.map(
                                channel => (

                                    <MenuItem
                                        key={
                                            channel.id
                                        }
                                        value={
                                            channel.id
                                        }
                                    >
                                        {
                                            channel.nombre
                                        }
                                    </MenuItem>

                                )
                            )
                        }

                    </TextField>


                    {/* MÉTODO DE PAGO */}

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

                        {
                            paymentMethods.map(
                                method => (

                                    <MenuItem
                                        key={
                                            method.id
                                        }
                                        value={
                                            method.id
                                        }
                                    >
                                        {
                                            method.nombre
                                        }
                                    </MenuItem>

                                )
                            )
                        }

                    </TextField>


                    {/* FACTURADA */}

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={
                                    sale.facturada
                                }
                                onChange={
                                    (event) =>
                                        setSale({
                                            ...sale,
                                            facturada:
                                                event
                                                    .target
                                                    .checked
                                        })
                                }
                            />
                        }
                        label="Venta Facturada"
                    />


                    <Typography
                        variant="subtitle1"
                    >
                        Agregar Producto
                    </Typography>


                    {/* BUSCADOR + SCANNER */}

                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row"
                        }}
                        spacing={1}
                        alignItems="flex-start"
                    >

                        <Autocomplete
                            options={products}
                            value={
                                products.find(
                                    product =>
                                        product.id ===
                                        item.productId
                                ) ?? null
                            }
                            onChange={
                                (_, product) =>
                                    selectProduct(
                                        product
                                    )
                            }
                            getOptionLabel={
                                (product) =>
                                    `${product.nombre} · ${product.sku}`
                            }
                            filterOptions={
                                (
                                    options,
                                    state
                                ) => {

                                    const search =
                                        state
                                            .inputValue
                                            .trim()
                                            .toLowerCase();

                                    if (!search) {
                                        return options;
                                    }

                                    return options.filter(
                                        product => {

                                            const nombre =
                                                product
                                                    .nombre
                                                    ?.toLowerCase()
                                                ?? "";

                                            const sku =
                                                product
                                                    .sku
                                                    ?.toLowerCase()
                                                ?? "";

                                            return (
                                                nombre.includes(
                                                    search
                                                ) ||
                                                sku.includes(
                                                    search
                                                )
                                            );
                                        }
                                    );
                                }
                            }
                            renderOption={
                                (
                                    props,
                                    product
                                ) => (

                                    <li
                                        {...props}
                                        key={
                                            product.id
                                        }
                                    >

                                        <Stack>

                                            <Typography>
                                                {
                                                    product.nombre
                                                }
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {
                                                    product.sku
                                                }

                                                {" · Stock: "}

                                                {
                                                    product.stockActual
                                                }
                                            </Typography>

                                        </Stack>

                                    </li>
                                )
                            }
                            renderInput={
                                (params) => (

                                    <TextField
                                        {...params}
                                        label="Buscar producto"
                                        placeholder="Nombre o SKU"
                                    />

                                )
                            }
                            sx={{
                                flex: 1,
                                width: "100%"
                            }}
                        />


                        <Button
                            variant="outlined"
                            onClick={() => {

                                setScanError("");
                                setScanMessage("");

                                setScannerOpen(
                                    true
                                );
                            }}
                            sx={{
                                whiteSpace:
                                    "nowrap",
                                minHeight: 56,
                                width: {
                                    xs: "100%",
                                    sm: "auto"
                                }
                            }}
                        >
                            📷 Escanear
                        </Button>

                    </Stack>


                    {/* MENSAJES SCANNER */}

                    {
                        scanMessage && (

                            <Alert
                                severity="success"
                                onClose={() =>
                                    setScanMessage("")
                                }
                            >
                                {
                                    scanMessage
                                }
                            </Alert>

                        )
                    }


                    {
                        scanError && (

                            <Alert
                                severity="warning"
                                onClose={() =>
                                    setScanError("")
                                }
                            >
                                {
                                    scanError
                                }
                            </Alert>

                        )
                    }


                    {/* STOCK */}

                    <Typography
                        variant="body2"
                    >
                        Stock disponible: {
                            products.find(
                                product =>
                                    product.id ===
                                    item.productId
                            )?.stockActual ?? 0
                        }
                    </Typography>


                    {/* CANTIDAD */}

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


                    {/* PRECIO */}

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


                    {/* AGREGAR MANUAL */}

                    <Button
                        variant="outlined"
                        onClick={
                            addItem
                        }
                    >
                        Agregar Producto
                    </Button>


                    {/* TABLA */}

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

                                <TableCell>
                                    Acciones
                                </TableCell>

                            </TableRow>

                        </TableHead>


                        <TableBody>

                            {
                                items.length === 0

                                    ? (

                                        <TableRow>

                                            <TableCell
                                                colSpan={4}
                                                align="center"
                                                sx={{
                                                    py: 6
                                                }}
                                            >

                                                <Typography
                                                    variant="body1"
                                                    color="text.secondary"
                                                >
                                                    Aún no hay productos agregados
                                                    a la venta
                                                </Typography>

                                            </TableCell>

                                        </TableRow>

                                    )

                                    : (

                                        items.map(
                                            (
                                                currentItem,
                                                index
                                            ) => {

                                                const product =
                                                    products.find(
                                                        product =>
                                                            product.id ===
                                                            currentItem.productId
                                                    );

                                                return (

                                                    <TableRow
                                                        key={
                                                            product?.id ??
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
                                                                currentItem.cantidad
                                                            }
                                                        </TableCell>

                                                        <TableCell>

                                                            {
                                                                new Intl.NumberFormat(
                                                                    "es-MX",
                                                                    {
                                                                        style:
                                                                            "currency",
                                                                        currency:
                                                                            "MXN"
                                                                    }
                                                                ).format(
                                                                    currentItem.precioUnitario
                                                                )
                                                            }

                                                        </TableCell>

                                                        <TableCell>

                                                            <Button
                                                                color="error"
                                                                size="small"
                                                                onClick={() =>
                                                                    removeItem(
                                                                        index
                                                                    )
                                                                }
                                                            >
                                                                <DeleteIcon />
                                                            </Button>

                                                        </TableCell>

                                                    </TableRow>

                                                );
                                            }
                                        )

                                    )
                            }

                        </TableBody>

                    </Table>


                    {/* TOTALES */}

                    <Typography>
                        Subtotal:{" "}
                        ${subtotal.toFixed(2)}
                    </Typography>

                    <Typography>
                        IVA:{" "}
                        ${iva.toFixed(2)}
                    </Typography>

                    <Typography>
                        Total:{" "}
                        ${total.toFixed(2)}
                    </Typography>


                    {/* LIMPIAR */}

                    <Button
                        variant="outlined"
                        color="warning"
                        onClick={
                            clearSale
                        }
                    >
                        Limpiar Venta
                    </Button>


                    {/* GUARDAR */}

                    <Button
                        type="submit"
                        variant="contained"
                    >
                        Guardar Venta
                    </Button>

                </Stack>

            </form>


            {/* SCANNER */}

            <BarcodeScanner
                open={
                    scannerOpen
                }
                onClose={() =>
                    setScannerOpen(false)
                }
                onDetected={
                    handleBarcodeDetected
                }
            />

        </Paper>
    );
}

export default SaleForm;