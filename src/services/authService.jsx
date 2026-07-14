import api from "./api";

export const login =
    async (
        username,
        password
    ) => {

        const token =
            btoa(
                `${username}:${password}`
            );

        const response =
            await api.get(
                "/products",
                {
                    headers: {
                        Authorization:
                            `Basic ${token}`
                    }
                }
            );

        return {
            success:
                response.status === 200,
            token
        };
    };