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
                "/auth/me",
                {
                    headers: {
                        Authorization:
                            `Basic ${token}`
                    }
                }
            );

        return {
            token,
            username:
                response.data.username,
            role:
                response.data.role
        };
    };