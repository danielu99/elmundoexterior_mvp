import api from "./api";

const API_URL =
    "http://localhost:8080/sales-channels";

export const getSalesChannels =
    async () => {

        const response =
            await api.get(API_URL);

        return response.data;
    };