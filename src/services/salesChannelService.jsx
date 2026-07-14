import api from "./api";

const API_URL =
    "/sales-channels";

export const getSalesChannels =
    async () => {

        const response =
            await api.get(API_URL);

        return response.data;
    };