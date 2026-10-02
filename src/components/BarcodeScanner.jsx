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
    const onDetectedRef = useRef(onDetected);

    const [error, setError] = useState("");

    /*
     * Conservamos siempre la versión más reciente
     * del callback sin reiniciar la cámara.
     */
    useEffect(() => {
        onDetectedRef.current = onDetected;
    }, [onDetected]);

    /*
     * Detiene completamente el scanner actual.
     */
    const stopScanner = () => {

        if (controlsRef.current) {

            try {
                controlsRef.current.stop();
            } catch (error) {
                console.warn(
                    "Error deteniendo scanner:",
                    error
                );
            }

            controlsRef.current = null;
        }

        /*
         * Como seguridad adicional detenemos
         * cualquier MediaStream conectado al video.
         */
        if (videoRef.current?.srcObject) {

            const stream =
                videoRef.current.srcObject;

            stream
                .getTracks()
                .forEach((track) => {
                    track.stop();
                });

            videoRef.current.srcObject = null;
        }
    };

    useEffect(() => {

        if (!open) {
            stopScanner();
            return;
        }

        let active = true;

        const startScanner = async () => {

            try {

                setError("");

                /*
                 * Nos aseguramos de no conservar
                 * una cámara anterior.
                 */
                stopScanner();

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

                const devices =
                    await BrowserMultiFormatReader
                        .listVideoInputDevices();

                if (!devices.length) {

                    throw new Error(
                        "No se encontró una cámara disponible."
                    );
                }

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
                            scannerControls
                        ) => {

                            if (
                                result &&
                                active
                            ) {

                                active = false;

                                const code =
                                    result.getText();

                                console.log(
                                    "BARCODE DETECTADO:",
                                    code
                                );

                                /*
                                 * Primero detenemos
                                 * completamente la cámara.
                                 */
                                scannerControls.stop();

                                controlsRef.current =
                                    null;

                                /*
                                 * Después notificamos
                                 * al componente padre.
                                 */
                                onDetectedRef.current(
                                    code
                                );
                            }
                        }
                    );

                /*
                 * Puede ocurrir que hayamos cerrado
                 * el modal mientras esperábamos
                 * a que iniciara la cámara.
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
                        "No fue posible acceder a la cámara. " +
                        "Revisa los permisos del navegador."
                    );
                }
            }
        };

        startScanner();

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
                    sx={{ mb: 2 }}
                >
                    Coloca el código de barras completo
                    dentro del recuadro.
                </Typography>

                {error && (

                    <Alert
                        severity="error"
                        sx={{ mb: 2 }}
                    >
                        {error}
                    </Alert>
                )}

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

                    {!error && (

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
                    )}

                </Box>

                {!error && (

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
                )}

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