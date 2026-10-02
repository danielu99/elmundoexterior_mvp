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
     * Conservamos siempre el callback más reciente
     * sin provocar que la cámara se reinicie.
     */
    useEffect(() => {

        onDetectedRef.current = onDetected;

    }, [onDetected]);

    /*
     * Detiene por completo cualquier cámara
     * que esté actualmente asociada al scanner.
     */
    const stopScanner = () => {

        if (controlsRef.current) {

            try {

                controlsRef.current.stop();

            } catch (stopError) {

                console.warn(
                    "Error deteniendo scanner:",
                    stopError
                );
            }

            controlsRef.current = null;
        }

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
                 * Por seguridad eliminamos cualquier
                 * stream anterior antes de solicitar
                 * uno nuevo.
                 */
                stopScanner();

                /*
                 * Limitamos ZXing a los códigos que
                 * normalmente encontraremos en productos.
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
                 * Ya NO seleccionamos manualmente una
                 * cámara por deviceId.
                 *
                 * Dejamos que el navegador elija la
                 * cámara trasera apropiada.
                 */
                const constraints = {

                    audio: false,

                    video: {

                        facingMode: {
                            ideal: "environment"
                        },

                        width: {
                            ideal: 1280
                        },

                        height: {
                            ideal: 720
                        }
                    }
                };

                const controls =
                    await codeReader.decodeFromConstraints(
                        constraints,
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
                                 * Primero detenemos ZXing.
                                 */
                                scannerControls.stop();

                                controlsRef.current =
                                    null;

                                /*
                                 * También detenemos el
                                 * MediaStream explícitamente.
                                 */
                                if (
                                    videoRef.current
                                        ?.srcObject
                                ) {

                                    const stream =
                                        videoRef.current
                                            .srcObject;

                                    stream
                                        .getTracks()
                                        .forEach(
                                            (track) => {

                                                track.stop();
                                            }
                                        );

                                    videoRef.current
                                        .srcObject = null;
                                }

                                /*
                                 * Finalmente avisamos al
                                 * ProductForm.
                                 */
                                onDetectedRef.current(
                                    code
                                );
                            }
                        }
                    );

                /*
                 * Si el modal se cerró mientras
                 * getUserMedia estaba arrancando,
                 * detenemos inmediatamente.
                 */
                if (!active) {

                    controls.stop();

                    return;
                }

                controlsRef.current =
                    controls;

                /*
                 * DEBUG:
                 * imprimimos la configuración real
                 * elegida por el navegador.
                 */
                if (
                    videoRef.current?.srcObject
                ) {

                    const videoTrack =
                        videoRef.current
                            .srcObject
                            .getVideoTracks()[0];

                    if (videoTrack) {

                        console.log(
                            "CONFIGURACIÓN CÁMARA:",
                            videoTrack.getSettings()
                        );
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