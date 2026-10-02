import { useEffect, useRef, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography
} from "@mui/material";

import {
    BrowserMultiFormatReader
} from "@zxing/browser";

import {
    BarcodeFormat,
    DecodeHintType
} from "@zxing/library";

function BarcodeScanner({
    open,
    onDetected,
    onClose
}) {

    const videoRef = useRef(null);
    const controlsRef = useRef(null);

    const [error, setError] = useState("");

    useEffect(() => {

        if (!open) {
            return;
        }

        let active = true;

        const startScanner = async () => {

            try {

                setError("");

                /*
                 * Solo buscamos códigos comerciales
                 * que normalmente encontraremos
                 * en los productos de la tienda.
                 */
                const hints = new Map();

                hints.set(
                    DecodeHintType.POSSIBLE_FORMATS,
                    [
                        BarcodeFormat.EAN_13,
                        BarcodeFormat.EAN_8,
                        BarcodeFormat.UPC_A,
                        BarcodeFormat.UPC_E
                    ]
                );

                hints.set(
                    DecodeHintType.TRY_HARDER,
                    true
                );

                const codeReader =
                    new BrowserMultiFormatReader(
                        hints
                    );

                /*
                 * Obtenemos las cámaras disponibles.
                 */
                const devices =
                    await BrowserMultiFormatReader
                        .listVideoInputDevices();

                if (!devices.length) {
                    throw new Error(
                        "No se encontró una cámara disponible."
                    );
                }

                /*
                 * Primera aproximación:
                 * en móvil/iPad normalmente la última
                 * cámara corresponde a una cámara trasera.
                 *
                 * Después podemos mejorar esto para solicitar
                 * explícitamente facingMode: environment.
                 */
                const selectedDevice =
                    devices[devices.length - 1];

                console.log(
                    "Cámara seleccionada:",
                    selectedDevice
                );

                const controls =
                    await codeReader.decodeFromVideoDevice(
                        selectedDevice.deviceId,
                        videoRef.current,
                        (
                            result,
                            decodeError,
                            controls
                        ) => {

                            if (
                                result &&
                                active
                            ) {

                                const code =
                                    result.getText();

                                console.log(
                                    "BARCODE DETECTADO:",
                                    code
                                );

                                active = false;

                                controls.stop();

                                onDetected(code);
                            }

                            /*
                             * No mostramos decodeError.
                             *
                             * ZXing genera errores continuamente
                             * mientras un frame no contiene un
                             * código legible. Eso es normal.
                             */
                        }
                    );

                controlsRef.current =
                    controls;

            } catch (scannerError) {

                console.error(
                    "Error iniciando scanner:",
                    scannerError
                );

                if (active) {

                    setError(
                        "No fue posible acceder a la cámara. " +
                        "Revisa los permisos del navegador."
                    );
                }
            }
        };

        startScanner();

        /*
         * Cleanup.
         *
         * Importantísimo para que la cámara
         * no permanezca encendida después
         * de cerrar el modal.
         */
        return () => {

            active = false;

            if (controlsRef.current) {

                controlsRef.current.stop();

                controlsRef.current = null;
            }
        };

    }, [open, onDetected]);

    const handleClose = () => {

        if (controlsRef.current) {

            controlsRef.current.stop();

            controlsRef.current = null;
        }

        onClose();
    };

    return (

        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
        >

            <DialogTitle>
                Escanear código de barras
            </DialogTitle>

            <DialogContent>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 2
                    }}
                >
                    Coloca el código de barras
                    completo dentro del recuadro.
                </Typography>

                {
                    error && (

                        <Alert
                            severity="error"
                            sx={{
                                mb: 2
                            }}
                        >
                            {error}
                        </Alert>
                    )
                }

                <Box
                    sx={{
                        position: "relative",
                        width: "100%",
                        overflow: "hidden",
                        borderRadius: 2,
                        bgcolor: "black"
                    }}
                >

                    <video
                        ref={videoRef}
                        muted
                        playsInline
                        style={{
                            width: "100%",
                            display: "block",
                            maxHeight: "60vh",
                            objectFit: "cover"
                        }}
                    />

                    {
                        !error && (

                            <Box
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform:
                                        "translate(-50%, -50%)",
                                    width: "85%",
                                    height: 110,
                                    border:
                                        "2px solid white",
                                    borderRadius: 2,
                                    pointerEvents: "none"
                                }}
                            />
                        )
                    }

                </Box>

                {
                    !error && (

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                display: "block",
                                textAlign: "center",
                                mt: 1
                            }}
                        >
                            Mantén el código completo,
                            bien iluminado y enfocado.
                        </Typography>
                    )
                }

            </DialogContent>

            <DialogActions>

                <Button
                    onClick={handleClose}
                >
                    Cancelar
                </Button>

            </DialogActions>

        </Dialog>
    );
}

export default BarcodeScanner;