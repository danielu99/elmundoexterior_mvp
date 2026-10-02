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
     * El MediaStream se crea UNA sola vez
     * y se conserva entre aperturas.
     */
    const streamRef = useRef(null);

    /*
     * Controla únicamente el loop
     * de decodificación de ZXing.
     */
    const scanControlsRef = useRef(null);

    const readerRef = useRef(null);

    const onDetectedRef = useRef(onDetected);

    const detectedRef = useRef(false);

    const [error, setError] = useState("");

    useEffect(() => {
        onDetectedRef.current = onDetected;
    }, [onDetected]);

    /*
     * Reader único.
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
            new BrowserMultiFormatReader(hints);
    }

    /*
     * Pausa la cámara SIN destruir
     * el MediaStream.
     */
    const pauseCamera = () => {

        const stream = streamRef.current;

        if (!stream) {
            return;
        }

        stream
            .getVideoTracks()
            .forEach((track) => {
                track.enabled = false;
            });
    };

    /*
     * Reactiva exactamente el mismo track.
     */
    const resumeCamera = async () => {

        const stream = streamRef.current;

        if (!stream) {
            return;
        }

        stream
            .getVideoTracks()
            .forEach((track) => {
                track.enabled = true;
            });

        /*
         * Safari puede necesitar play()
         * nuevamente después de reactivar.
         */
        if (videoRef.current) {

            videoRef.current.srcObject =
                stream;

            try {
                await videoRef.current.play();
            } catch (playError) {
                console.warn(
                    "No se pudo reanudar el video:",
                    playError
                );
            }
        }
    };

    /*
     * Creamos la cámara UNA sola vez.
     */
    const createCamera = async () => {

        /*
         * Pedimos cámara trasera.
         *
         * No enumeramos devices ni escogemos
         * devices[last].
         */
        const stream =
            await navigator.mediaDevices
                .getUserMedia({
                    audio: false,
                    video: {
                        facingMode: {
                            ideal: "environment"
                        }
                    }
                });

        streamRef.current = stream;

        if (videoRef.current) {

            videoRef.current.srcObject =
                stream;

            await videoRef.current.play();
        }

        return stream;
    };

    /*
     * Inicia SOLO el proceso de lectura.
     *
     * IMPORTANTE:
     * decodeFromStream recibe nuestro stream.
     * ZXing NO pide otra cámara.
     */
    const startDecoding = async () => {

        const stream =
            streamRef.current;

        if (!stream) {
            return;
        }

        detectedRef.current = false;

        const controls =
            await readerRef.current
                .decodeFromStream(
                    stream,
                    videoRef.current,
                    (
                        result,
                        decodeError,
                        controls
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
                         * Pausamos el track.
                         *
                         * NO hacemos track.stop().
                         */
                        pauseCamera();

                        /*
                         * El padre cerrará el Dialog.
                         */
                        onDetectedRef.current(
                            code
                        );
                    }
                );

        scanControlsRef.current =
            controls;
    };

    useEffect(() => {

        let cancelled = false;

        const handleScanner = async () => {

            /*
             * CERRAR
             */
            if (!open) {

                pauseCamera();

                return;
            }

            /*
             * ABRIR
             */
            try {

                setError("");

                /*
                 * Primera apertura:
                 * creamos el MediaStream.
                 */
                if (!streamRef.current) {

                    await createCamera();

                    if (cancelled) {
                        return;
                    }

                } else {

                    /*
                     * Aperturas posteriores:
                     * NO getUserMedia().
                     *
                     * Reactivamos exactamente
                     * el mismo track.
                     */
                    await resumeCamera();
                }

                if (cancelled) {
                    return;
                }

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

        handleScanner();

        return () => {

            cancelled = true;

            /*
             * Al cerrar el Dialog solamente
             * pausamos.
             */
            pauseCamera();
        };

    }, [open]);

    /*
     * SOLO cuando BarcodeScanner desaparece
     * realmente de la aplicación liberamos
     * físicamente la cámara.
     */
    useEffect(() => {

        return () => {

            if (scanControlsRef.current) {

                try {
                    scanControlsRef.current.stop();
                } catch (stopError) {
                    console.warn(stopError);
                }

                scanControlsRef.current = null;
            }

            if (streamRef.current) {

                streamRef.current
                    .getTracks()
                    .forEach((track) => {
                        track.stop();
                    });

                streamRef.current = null;
            }

            if (videoRef.current) {
                videoRef.current.srcObject = null;
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