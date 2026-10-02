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

    /*
     * Guardamos los controles de la sesión
     * de cámara actualmente activa.
     */
    const controlsRef = useRef(null);

    /*
     * Evitamos que cambios en la referencia
     * de onDetected reinicien la cámara.
     */
    const onDetectedRef = useRef(onDetected);

    /*
     * Creamos UNA sola instancia del reader
     * durante la vida del componente.
     */
    const readerRef = useRef(null);

    const [error, setError] = useState("");

    /*
     * Actualizamos el callback sin tocar
     * el scanner.
     */
    useEffect(() => {

        onDetectedRef.current = onDetected;

    }, [onDetected]);

    /*
     * Inicializamos ZXing una sola vez.
     */
    if (!readerRef.current) {

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

        readerRef.current =
            new BrowserMultiFormatReader(
                hints
            );
    }

    /*
     * ÚNICA forma en que detenemos
     * una sesión de cámara.
     *
     * Dejamos que ZXing administre
     * el MediaStream.
     */
    const stopScanner = () => {

        if (!controlsRef.current) {
            return;
        }

        try {

            controlsRef.current.stop();

        } catch (stopError) {

            console.warn(
                "Error deteniendo scanner:",
                stopError
            );
        }

        controlsRef.current = null;
    };

    useEffect(() => {

        /*
         * Si cerramos el Dialog,
         * detenemos la sesión activa.
         */
        if (!open) {

            stopScanner();

            return;
        }

        let active = true;

        const startScanner = async () => {

            try {

                setError("");

                const codeReader =
                    readerRef.current;

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
                 * Por ahora mantenemos la selección
                 * que sabemos que en la primera
                 * apertura funciona correctamente.
                 */
                const selectedDevice =
                    devices[devices.length - 1];

                console.log(
                    "Iniciando cámara:",
                    selectedDevice.label
                );

                const controls =
                    await codeReader.decodeFromVideoDevice(
                        selectedDevice.deviceId,
                        videoRef.current,
                        (
                            result,
                            decodeError,
                            scannerControls
                        ) => {

                            /*
                             * ZXing llama este callback
                             * continuamente.
                             *
                             * Que no haya resultado en un
                             * frame es completamente normal.
                             */
                            if (
                                !result ||
                                !active
                            ) {
                                return;
                            }

                            /*
                             * Impedimos una segunda lectura
                             * de la misma sesión.
                             */
                            active = false;

                            const code =
                                result.getText();

                            console.log(
                                "BARCODE DETECTADO:",
                                code
                            );

                            /*
                             * IMPORTANTE:
                             *
                             * Solo usamos los controles
                             * proporcionados por ZXing.
                             *
                             * No tocamos srcObject.
                             * No hacemos track.stop().
                             */
                            try {

                                scannerControls.stop();

                            } catch (stopError) {

                                console.warn(
                                    "Error deteniendo cámara:",
                                    stopError
                                );
                            }

                            controlsRef.current =
                                null;

                            /*
                             * Avisamos al padre.
                             *
                             * ProductForm cambiará open
                             * a false después de recibir
                             * el código.
                             */
                            onDetectedRef.current(
                                code
                            );
                        }
                    );

                /*
                 * Puede ocurrir que el usuario cierre
                 * el modal mientras Safari todavía
                 * estaba abriendo la cámara.
                 */
                if (!active) {

                    controls.stop();

                    return;
                }

                controlsRef.current =
                    controls;

            } catch (scannerError) {

                console.error(
                    "Error iniciando scanner:",
                    scannerError
                );

                if (active) {

                    setError(
                        "No fue posible iniciar la cámara. " +
                        "Revisa los permisos e inténtalo nuevamente."
                    );
                }
            }
        };

        startScanner();

        /*
         * Cuando open cambia o el componente
         * desaparece, detenemos mediante ZXing.
         */
        return () => {

            active = false;

            stopScanner();
        };

    }, [open]);

    const handleClose = () => {

        stopScanner();

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
                    Coloca el código de barras completo
                    dentro del recuadro.
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
                        autoPlay
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