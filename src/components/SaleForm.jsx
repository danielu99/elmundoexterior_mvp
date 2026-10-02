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

    const [items, setItems] =
        useState([]);

    const [scannerOpen, setScannerOpen] =
        useState(false);

    const [scanMessage, setScanMessage] =
        useState("");

    const [scanError, setScanError] =
        useState("");


    /*
     * Selecciona un producto en el formulario.
     *
     * Tanto el Autocomplete como el scanner
     * terminan pasando por aquí.
     */
    const selectProduct = (product) => {

        setScanMessage("");
        setScanError("");

        if (!product) {

            setItem({
                productId: "",
                cantidad: 1,
                precioUnitario: ""
            });

            return;
        }

        setItem({
            productId:
                product.id,

            cantidad:
                1,

            precioUnitario:
                product.precioFinal ?? ""
        });
    };


    /*
     * Agrega al carrito el producto que
     * actualmente está seleccionado.
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
         * Validaciones básicas.
         */
        if (
            !item.cantidad ||
            item.cantidad <= 0
        ) {

            alert(
                "La cantidad debe ser mayor a 0"
            );

            return;
        }

        if (
            item.precioUnitario === "" ||
            item.precioUnitario < 0
        ) {

            alert(
                "Ingresa un precio válido"
            );

            return;
        }


        /*
         * Revisamos si el producto ya existe
         * en el carrito.
         */
        const existingItem =
            items.find(
                currentItem =>
                    currentItem.productId ===
                    selectedProduct.id
            );


        if (existingItem) {

            const newQuantity =
                existingItem.cantidad +
                item.cantidad;

            /*
             * Validamos el stock tomando en
             * cuenta lo que ya estaba agregado.
             */
            if (
                newQuantity >
                selectedProduct.stockActual
            ) {

                alert(
                    "No hay suficiente stock"
                );

                return;
            }


            /*
             * Si ya existía, acumulamos cantidad.
             *
             * También conservamos el precio que
             * acaba de capturar el usuario.
             */
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
             * Producto nuevo.
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
         * Limpiamos el formulario para
         * capturar el siguiente producto.
         */
        setItem({
            productId: "",
            cantidad: 1,
            precioUnitario: ""
        });

        setScanMessage("");
        setScanError("");
    };


    /*
     * Código confirmado por BarcodeScanner.
     *
     * IMPORTANTE:
     * ya NO agrega automáticamente al carrito.
     *
     * Únicamente busca el producto y lo deja
     * seleccionado para que el usuario pueda
     * modificar cantidad y precio.
     */
    const handleBarcodeDetected =
        async (code) => {

            setScannerOpen(false);

            setScanMessage("");
            setScanError("");

            try {

                const response =
                    await api.get(
                        `/products/barcode/${
                            encodeURIComponent(code)
                        }`
                    );

                const product =
                    response.data;


                /*
                 * Si no tiene stock, permitimos
                 * identificarlo pero avisamos
                 * inmediatamente.
                 */
                if (
                    product.stockActual <= 0
                ) {

                    setItem({
                        productId:
                            product.id,

                        cantidad:
                            1,

                        precioUnitario:
                            product.precioFinal ?? ""
                    });

                    setScanError(
                        `${product.nombre} no tiene stock disponible.`
                    );

                    return;
                }


                /*
                 * Lo seleccionamos exactamente
                 * igual que si se hubiera elegido
                 * desde el buscador.
                 */
                setItem({
                    productId:
                        product.id,

                    cantidad:
                        1,

                    precioUnitario:
                        product.precioFinal ?? ""
                });


                setScanMessage(
                    `${product.nombre} seleccionado. Puedes ajustar cantidad o precio antes de agregarlo.`
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


    /*
     * Eliminar producto del carrito.
     */
    const removeItem =
        (index) => {

            setItems(
                items.filter(
                    (_, i) =>
                        i !== index
                )
            );
        };


    /*
     * Limpiar toda la venta.
     */
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


    /*
     * Totales.
     */
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


    /*
     * Guardar venta.
     */
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


    /*
     * Producto actualmente seleccionado.
     */
    const selectedProduct =
        products.find(
            product =>
                product.id ===
                item.productId
        ) ?? null;


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
                            options={
                                products
                            }
                            value={
                                selectedProduct
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
                            isOptionEqualToValue={
                                (
                                    option,
                                    value
                                ) =>
                                    option.id ===
                                    value.id
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

                                minHeight:
                                    56,

                                width: {
                                    xs:
                                        "100%",
                                    sm:
                                        "auto"
                                }
                            }}
                        >
                            📷 Escanear
                        </Button>

                    </Stack>


                    {/* RESULTADO DEL SCANNER */}

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
                            selectedProduct
                                ?.stockActual ?? 0
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
                                        event
                                            .target
                                            .value
                                    )
                            })
                        }
                        inputProps={{
                            min: 1
                        }}
                    />


                    {/* PRECIO UNITARIO */}

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
                                        event
                                            .target
                                            .value
                                    )
                            })
                        }
                        inputProps={{
                            min: 0,
                            step: "0.01"
                        }}
                    />


                    {/* AGREGAR AL CARRITO */}

                    <Button
                        variant="outlined"
                        onClick={
                            addItem
                        }
                        disabled={
                            !selectedProduct
                        }
                    >
                        Agregar Producto
                    </Button>


                    {/* CARRITO */}

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
                                                colSpan={
                                                    4
                                                }
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
                                                            product
                                                                ?.id ??
                                                            index
                                                        }
                                                    >

                                                        <TableCell>
                                                            {
                                                                product
                                                                    ?.nombre
                                                            }
                                                        </TableCell>

                                                        <TableCell>
                                                            {
                                                                currentItem
                                                                    .cantidad
                                                            }
                                                        </TableCell>

                                                        <TableCell>

                                                            {
                                                                new Intl
                                                                    .NumberFormat(
                                                                        "es-MX",
                                                                        {
                                                                            style:
                                                                                "currency",
                                                                            currency:
                                                                                "MXN"
                                                                        }
                                                                    )
                                                                    .format(
                                                                        currentItem
                                                                            .precioUnitario
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


            {/* BARCODE SCANNER */}

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