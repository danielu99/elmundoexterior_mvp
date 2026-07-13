import {
    useState
} from "react";

import {
    Container,
    Paper,
    Typography,
    TextField,
    Button
} from "@mui/material";

import {
    login
} from "../services/authService";

function Login({
    onLogin
}) {

    const [username,
        setUsername] =
        useState("");

    const [password,
        setPassword] =
        useState("");

    const [error,
        setError] =
        useState("");

    const handleSubmit =
        async (event) => {

            event.preventDefault();

            try {

                const result =
                    await login(
                        username,
                        password
                    );

                localStorage.setItem(
                    "authToken",
                    result.token
                );

                onLogin();

            } catch {

                setError(
                    "Usuario o contraseña incorrectos"
                );

            }
        };

    return (

        <Container
            maxWidth="sm"
            sx={{ mt: 10 }}
        >

            <Paper sx={{ p: 4 }}>

                <Typography
                    variant="h5"
                    gutterBottom
                >

                    Iniciar Sesión

                </Typography>

                <form
                    onSubmit={
                        handleSubmit
                    }
                >

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Usuario"
                        value={username}
                        onChange={
                            e =>
                                setUsername(
                                    e.target.value
                                )
                        }
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        type="password"
                        label="Contraseña"
                        value={password}
                        onChange={
                            e =>
                                setPassword(
                                    e.target.value
                                )
                        }
                    />

                    {error && (

                        <Typography
                            color="error"
                            sx={{ mt: 1 }}
                        >

                            {error}

                        </Typography>

                    )}

                    <Button
                        fullWidth
                        sx={{ mt: 2 }}
                        type="submit"
                        variant="contained"
                    >

                        Entrar

                    </Button>

                </form>

            </Paper>

        </Container>

    );
}

export default Login;