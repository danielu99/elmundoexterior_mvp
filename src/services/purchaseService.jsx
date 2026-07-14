import api from "./api";

const API_URL =
    "/purchases";

export const createPurchase =
    async (purchase) => {

        const response =
            await api.post(
                API_URL,
                purchase
            );

        return response.data;
    };

export const getPurchases =
    async () => {

        const response =
            await api.get(
                API_URL
            );

        return response.data;
    };