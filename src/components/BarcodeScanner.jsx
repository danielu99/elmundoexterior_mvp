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
     * MediaStream administrado por nosotros.
     */
    const streamRef = useRef(null);

    /*
     * Control del loop de ZXing.
     */
    const scanControlsRef = useRef(null);

    /*
     * Reader de ZXing.
     */
    const readerRef = useRef(null);

    /*
     * Callback actualizado sin reiniciar
     * el scanner.
     */
    const onDetectedRef = useRef(onDetected);

    /*
     * Evita procesar después de aceptar
     * definitivamente un código.
     */
    const detectedRef = useRef(false);

    /*
     * Confirmación de lectura.
     *
     * Queremos recibir el mismo código
     * dos veces consecutivas antes
     * de aceptarlo.
     */
    const candidateRef = useRef({
        code: null,
        count: 0
    });

    const [error, setError] =
        useState("");

    const [status, setStatus] =
        useState("Buscando código...");


    /*
     * Mantener callback actualizado.
     */
    useEffect(() => {

        onDetectedRef.current =
            onDetected;

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
            new BrowserMultiFormatReader(
                hints
            );
    }


    /*
     * Valida checksum EAN-13 / EAN-8 / UPC-A.
     *
     * UPC-E tiene reglas de expansión propias,
     * por lo que dejamos que ZXing valide
     * ese formato internamente.
     */
    const isValidBarcode = (code) => {

        if (!code) {
            return false;
        }

        /*
         * Sólo números.
         */
        if (!/^\d+$/.test(code)) {
            return false;
        }

        /*
         * UPC-E.
         *
         * ZXing ya valida el formato durante
         * la decodificación.
         */
        if (code.length === 8) {

            /*
             * Una cadena de 8 dígitos puede ser
             * EAN-8 o UPC-E.
             *
             * Intentamos primero checksum EAN-8.
             *
             * Si no coincide, no la descartamos
             * aquí porque podría ser UPC-E.
             */
            return true;
        }

        /*
         * Sólo validamos explícitamente
         * EAN-13 y UPC-A.
         */
        if (
            code.length !== 12 &&
            code.length !== 13
        ) {
            return false;
        }

        const digits =
            code
                .split("")
                .map(Number);

        const checkDigit =
            digits[
                digits.length - 1
            ];

        const body =
            digits.slice(
                0,
                -1
            );

        let sum = 0;

        /*
         * Algoritmo GTIN:
         *
         * empezando desde la derecha del cuerpo,
         * multiplicamos alternativamente
         * por 3 y por 1.
         */
        for (
            let i = body.length - 1;
            i >= 0;
            i--
        ) {

            const positionFromRight =
                body.length - 1 - i;

            const multiplier =
                positionFromRight % 2 === 0
                    ? 3
                    : 1;

            sum +=
                body[i] *
                multiplier;
        }

        const calculatedCheckDigit =
            (10 - (sum % 10)) % 10;

        return (
            calculatedCheckDigit ===
            checkDigit
        );
    };


    /*
     * Pausa temporalmente la cámara.
     *
     * Esto se usa mientras React procesa
     * el cierre del Dialog.
     */
    const pauseCamera = () => {

        const stream =
            streamRef.current;

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
     * Destruye completamente la sesión.
     *
     * Esto libera físicamente la cámara
     * y apaga el indicador verde de iOS.
     */
    const destroyCamera = () => {

        /*
         * Detener ZXing.
         */
        if (
            scanControlsRef.current
        ) {

            try {

                scanControlsRef
                    .current
                    .stop();

            } catch (stopError) {

                console.warn(
                    "Error deteniendo ZXing:",
                    stopError
                );
            }

            scanControlsRef.current =
                null;
        }

        /*
         * Liberar MediaStream.
         */
        if (streamRef.current) {

            streamRef.current
                .getTracks()
                .forEach(
                    (track) => {

                        try {

                            track.stop();

                        } catch (
                            trackError
                        ) {

                            console.warn(
                                "Error deteniendo track:",
                                trackError
                            );
                        }
                    }
                );

            streamRef.current =
                null;
        }

        /*
         * Desconectar <video>.
         */
        if (videoRef.current) {

            videoRef.current.srcObject =
                null;
        }
    };


    /*
     * Crear cámara.
     *
     * Pedimos explícitamente la cámara
     * trasera mediante facingMode.
     */
    const createCamera =
        async () => {

            const stream =
                await navigator
                    .mediaDevices
                    .getUserMedia({
                        audio: false,

                        video: {

                            facingMode: {
                                ideal:
                                    "environment"
                            }
                        }
                    });

            streamRef.current =
                stream;

            if (videoRef.current) {

                videoRef.current
                    .srcObject =
                    stream;

                await videoRef.current
                    .play();
            }

            return stream;
        };


    /*
     * Iniciar lectura ZXing sobre
     * NUESTRO MediaStream.
     *
     * ZXing no solicita otra cámara.
     */
    const startDecoding =
        async () => {

            const stream =
                streamRef.current;

            if (!stream) {
                return;
            }

            /*
             * Reiniciar estado de lectura.
             */
            detectedRef.current =
                false;

            candidateRef.current = {
                code: null,
                count: 0
            };

            setStatus(
                "Buscando código..."
            );


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

                            /*
                             * Todavía no existe
                             * lectura válida.
                             */
                            if (
                                !result ||
                                detectedRef.current
                            ) {
                                return;
                            }


                            const code =
                                result
                                    .getText()
                                    .trim();


                            /*
                             * Validación básica
                             * de GTIN.
                             */
                            if (
                                !isValidBarcode(
                                    code
                                )
                            ) {

                                console.warn(
                                    "Lectura descartada:",
                                    code
                                );

                                candidateRef.current = {
                                    code: null,
                                    count: 0
                                };

                                setStatus(
                                    "Lectura inestable. Mantén el código frente a la cámara..."
                                );

                                return;
                            }


                            /*
                             * Primera vez que vemos
                             * este código.
                             */
                            if (
                                candidateRef
                                    .current
                                    .code !==
                                code
                            ) {

                                candidateRef.current = {
                                    code,
                                    count: 1
                                };

                                setStatus(
                                    "Código detectado. Confirmando..."
                                );

                                return;
                            }


                            /*
                             * Mismo código nuevamente.
                             */
                            candidateRef.current = {
                                code,
                                count:
                                    candidateRef
                                        .current
                                        .count + 1
                            };


                            /*
                             * Todavía necesitamos
                             * confirmación.
                             */
                            if (
                                candidateRef
                                    .current
                                    .count < 2
                            ) {
                                return;
                            }


                            /*
                             * 🎉 CÓDIGO CONFIRMADO.
                             */
                            detectedRef.current =
                                true;

                            console.log(
                                "BARCODE CONFIRMADO:",
                                code
                            );

                            setStatus(
                                "Código confirmado"
                            );


                            /*
                             * Pausamos inmediatamente
                             * para que no siga leyendo.
                             */
                            pauseCamera();


                            /*
                             * Avisamos al padre.
                             *
                             * SaleForm cerrará el Dialog
                             * y el effect destruirá
                             * físicamente la cámara.
                             */
                            onDetectedRef.current(
                                code
                            );
                        }
                    );


            scanControlsRef.current =
                controls;
        };


    /*
     * Apertura / cierre.
     */
    useEffect(() => {

        let cancelled =
            false;


        const handleScanner =
            async () => {

                /*
                 * CERRAR
                 */
                if (!open) {

                    destroyCamera();

                    return;
                }


                /*
                 * ABRIR
                 */
                try {

                    setError("");

                    setStatus(
                        "Buscando código..."
                    );

                    candidateRef.current = {
                        code: null,
                        count: 0
                    };

                    detectedRef.current =
                        false;


                    /*
                     * Cada apertura crea una
                     * sesión limpia de cámara.
                     */
                    if (
                        !streamRef.current
                    ) {

                        await createCamera();

                        if (cancelled) {

                            destroyCamera();

                            return;
                        }
                    }


                    await startDecoding();


                } catch (
                    scannerError
                ) {

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
             * Primero pausamos.
             *
             * Cuando open cambie a false,
             * la siguiente ejecución del effect
             * hará destroyCamera().
             */
            pauseCamera();
        };

    }, [open]);


    /*
     * Seguridad adicional:
     *
     * si BarcodeScanner desaparece
     * completamente del DOM,
     * liberamos todo.
     */
    useEffect(() => {

        return () => {

            destroyCamera();

        };

    }, []);


    /*
     * Cancelar.
     *
     * El padre cambiará open a false
     * y el effect liberará la cámara.
     */
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
                        position:
                            "relative",

                        width:
                            "100%",

                        overflow:
                            "hidden",

                        borderRadius:
                            2,

                        bgcolor:
                            "black"
                    }}
                >

                    <video
                        ref={videoRef}
                        muted
                        playsInline
                        autoPlay
                        style={{
                            width:
                                "100%",

                            display:
                                "block",

                            maxHeight:
                                "60vh",

                            objectFit:
                                "cover"
                        }}
                    />


                    {
                        !error && (

                            <Box
                                sx={{
                                    position:
                                        "absolute",

                                    top:
                                        "50%",

                                    left:
                                        "50%",

                                    transform:
                                        "translate(-50%, -50%)",

                                    width:
                                        "85%",

                                    height:
                                        110,

                                    border:
                                        "2px solid white",

                                    borderRadius:
                                        2,

                                    pointerEvents:
                                        "none"
                                }}
                            />

                        )
                    }

                </Box>


                {
                    !error && (

                        <>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    display:
                                        "block",

                                    textAlign:
                                        "center",

                                    mt:
                                        1
                                }}
                            >
                                Mantén el código completo,
                                bien iluminado y enfocado.
                            </Typography>


                            <Typography
                                variant="caption"
                                sx={{
                                    display:
                                        "block",

                                    textAlign:
                                        "center",

                                    mt:
                                        0.5,

                                    fontWeight:
                                        600
                                }}
                            >
                                {status}
                            </Typography>
                        </>

                    )
                }

            </DialogContent>


            <DialogActions>

                <Button
                    onClick={
                        handleClose
                    }
                >
                    Cancelar
                </Button>

            </DialogActions>

        </Dialog>
    );
}


export default BarcodeScanner;