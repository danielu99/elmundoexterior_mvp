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
     * Stream de cámara.
     *
     * IMPORTANTE:
     * Lo conservamos entre aperturas del Dialog.
     */
    const streamRef = useRef(null);

    /*
     * Controles de la sesión de lectura ZXing.
     */
    const controlsRef = useRef(null);

    /*
     * Reader único.
     */
    const readerRef = useRef(null);

    /*
     * Callback actualizado sin provocar
     * reinicios de cámara.
     */
    const onDetectedRef = useRef(onDetected);

    /*
     * Evita procesar dos veces el mismo
     * resultado durante una apertura.
     */
    const detectedRef = useRef(false);

    const [error, setError] = useState("");

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
     * PAUSAR cámara.
     *
     * No hacemos track.stop().
     *
     * El MediaStream continúa existiendo,
     * pero deja de entregar frames.
     */
    const pauseCamera = () => {

        if (!streamRef.current) {
            return;
        }

        streamRef.current
            .getVideoTracks()
            .forEach((track) => {

                track.enabled = false;

            });
    };

    /*
     * REACTIVAR la misma cámara.
     */
    const resumeCamera = () => {

        if (!streamRef.current) {
            return;
        }

        streamRef.current
            .getVideoTracks()
            .forEach((track) => {

                track.enabled = true;

            });
    };

    /*
     * Detenemos únicamente el proceso
     * de decodificación de ZXing.
     *
     * NO destruimos el MediaStream.
     */
    const stopDecoding = () => {

        if (!controlsRef.current) {
            return;
        }

        /*
         * OJO:
         *
         * No usamos controls.stop() aquí,
         * porque puede detener también
         * el MediaStream que queremos conservar.
         */

        controlsRef.current = null;
    };

    /*
     * Primera inicialización de la cámara.
     */
    const initializeCamera = async () => {

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
            "Inicializando cámara:",
            selectedDevice.label
        );

        /*
         * Creamos nosotros el MediaStream.
         *
         * De esta manera podemos conservarlo
         * aunque el Dialog se cierre.
         */
        const stream =
            await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    deviceId: {
                        exact:
                            selectedDevice.deviceId
                    }
                }
            });

        streamRef.current =
            stream;

        return stream;
    };

    /*
     * Inicia ZXing utilizando nuestro
     * MediaStream existente.
     */
    const startDecoding = async () => {

        detectedRef.current = false;

        const codeReader =
            readerRef.current;

        /*
         * Obtenemos el track que YA tenemos.
         */
        const track =
            streamRef.current
                ?.getVideoTracks()?.[0];

        if (!track) {

            throw new Error(
                "No existe un stream de cámara activo."
            );
        }

        /*
         * ZXing necesita constraints.
         *
         * Como reutilizamos el mismo deviceId,
         * Safari debería mantener exactamente
         * la misma cámara.
         */
        const settings =
            track.getSettings();

        const deviceId =
            settings.deviceId;

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
                        detectedRef.current
                    ) {
                        return;
                    }

                    detectedRef.current = true;

                    const code =
                        result.getText();

                    console.log(
                        "BARCODE DETECTADO:",
                        code
                    );

                    /*
                     * NO destruimos la cámara.
                     *
                     * Simplemente dejamos de entregar
                     * frames.
                     */
                    pauseCamera();

                    onDetectedRef.current(
                        code
                    );
                }
            );

        controlsRef.current =
            controls;
    };

    /*
     * Abrir / cerrar Dialog.
     */
    useEffect(() => {

        let cancelled = false;

        const handleOpen = async () => {

            if (!open) {

                pauseCamera();

                return;
            }

            try {

                setError("");

                /*
                 * Primera apertura:
                 * todavía no existe cámara.
                 */
                if (!streamRef.current) {

                    await initializeCamera();

                    if (cancelled) {
                        return;
                    }
                }

                /*
                 * Segunda, tercera, cuarta...
                 * simplemente reactivamos el mismo
                 * MediaStream.
                 */
                resumeCamera();

                await startDecoding();

            } catch (scannerError) {

                console.error(
                    "Error iniciando scanner:",
                    scannerError
                );

                if (!cancelled) {

                    setError(
                        "No fue posible iniciar la cámara. " +
                        "Revisa los permisos del navegador."
                    );
                }
            }
        };

        handleOpen();

        return () => {

            cancelled = true;

            /*
             * IMPORTANTE:
             * aquí tampoco hacemos stop().
             */
            pauseCamera();
        };

    }, [open]);

    /*
     * Al destruir BarcodeScanner por completo
     * SÍ liberamos físicamente la cámara.
     */
    useEffect(() => {

        return () => {

            if (controlsRef.current) {

                try {

                    controlsRef.current.stop();

                } catch (error) {

                    console.warn(
                        "Error cerrando ZXing:",
                        error
                    );
                }

                controlsRef.current = null;
            }

            if (streamRef.current) {

                streamRef.current
                    .getTracks()
                    .forEach((track) => {

                        track.stop();

                    });

                streamRef.current = null;
            }
        };

    }, []);

    const handleClose = () => {

        pauseCamera();

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