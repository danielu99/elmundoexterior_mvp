import {
    Backdrop,
    CircularProgress,
    Stack,
    Typography
} from "@mui/material";

function LoadingOverlay({
    open,
    message = "Cargando..."
}) {

    return (

        <Backdrop
            open={open}
            sx={{
                color: "#fff",
                zIndex: (theme) =>
                    theme.zIndex.modal + 1,
                backdropFilter: "blur(3px)"
            }}
        >

            <Stack
                spacing={2}
                alignItems="center"
            >

                <CircularProgress
                    color="inherit"
                    size={48}
                />

                <Typography
                    variant="h6"
                    fontWeight="500"
                >
                    {message}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        opacity: 0.8
                    }}
                >
                    Esto puede tomar unos segundos
                </Typography>

            </Stack>

        </Backdrop>

    );
}

export default LoadingOverlay;