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

    /*
     * Aquí recordamos la cámara que funcionó.
     * NO se pierde al cerrar el Dialog.
     */
    const preferredDeviceIdRef = useRef(null);

    /*
     * Evita que un cambio de referencia de
     * onDetected reinicie el scanner.
     */
    const onDetectedRef = useRef(onDetected);

    const [error, setError] = useState("");

    useEffect(() => {

        onDetectedRef.current = onDetected;

    }, [onDetected]);

    /*
     * Apaga completamente la cámara.
     */
    const stopScanner = () => {

        if (controlsRef.current) {

            try {
                controlsRef.current.stop();
            } catch (stopError) {
                console.warn(
                    "Error deteniendo ZXing:",
                    stopError
                );
            }

            controlsRef.current = null;
        }

        const stream =
            videoRef.current?.srcObject;

        if (stream) {

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
            return;
        }

        let active = true;

        const startScanner = async () => {

            try {

                setError("");

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
                 * Si ya tenemos una cámara que funcionó,
                 * NO volvemos a seleccionar otra.
                 */
                let deviceId =
                    preferredDeviceIdRef.current;

                if (!deviceId) {

                    const devices =
                        await BrowserMultiFormatReader
                            .listVideoInputDevices();

                    if (!devices.length) {

                        throw new Error(
                            "No se encontró una cámara disponible."
                        );
                    }

                    /*
                     * Solo hacemos esta selección
                     * durante la primera apertura.
                     */
                    const selectedDevice =
                        devices[devices.length - 1];

                    deviceId =
                        selectedDevice.deviceId;

                    preferredDeviceIdRef.current =
                        deviceId;

                    console.log(
                        "Cámara inicial seleccionada:",
                        selectedDevice.label
                    );

                } else {

                    console.log(
                        "Reutilizando cámara:",
                        deviceId
                    );
                }

                const controls =
                    await codeReader.decodeFromVideoDevice(
                        deviceId,
                        videoRef.current,
                        (
                            result,
                            decodeError,
                            scannerControls
                        ) => {

                            if (
                                !result ||
                                !active
                            ) {
                                return;
                            }

                            /*
                             * Bloqueamos nuevas lecturas.
                             */
                            active = false;

                            const code =
                                result.getText();

                            console.log(
                                "BARCODE DETECTADO:",
                                code
                            );

                            /*
                             * Apagamos ZXing.
                             */
                            try {
                                scannerControls.stop();
                            } catch (stopError) {
                                console.warn(
                                    "Error deteniendo scanner:",
                                    stopError
                                );
                            }

                            controlsRef.current =
                                null;

                            /*
                             * Apagamos explícitamente
                             * todos los tracks.
                             */
                            const stream =
                                videoRef.current?.srcObject;

                            if (stream) {

                                stream
                                    .getTracks()
                                    .forEach(
                                        (track) => {
                                            track.stop();
                                        }
                                    );

                                videoRef.current.srcObject =
                                    null;
                            }

                            /*
                             * Ya con la cámara apagada,
                             * notificamos al ProductForm.
                             */
                            onDetectedRef.current(
                                code
                            );
                        }
                    );

                /*
                 * El usuario pudo cerrar el modal
                 * mientras arrancaba getUserMedia().
                 */
                if (!active) {

                    controls.stop();

                    return;
                }

                controlsRef.current =
                    controls;

                /*
                 * Guardamos el deviceId REAL del track
                 * que terminó usando Safari.
                 *
                 * Esto es mejor que confiar únicamente
                 * en el deviceId solicitado.
                 */
                const stream =
                    videoRef.current?.srcObject;

                const videoTrack =
                    stream
                        ?.getVideoTracks()
                        ?.[0];

                if (videoTrack) {

                    const settings =
                        videoTrack.getSettings();

                    console.log(
                        "Configuración real:",
                        settings
                    );

                    if (settings.deviceId) {

                        preferredDeviceIdRef.current =
                            settings.deviceId;
                    }
                }

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