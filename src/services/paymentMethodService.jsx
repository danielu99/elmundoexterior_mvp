import api from "./api";

const API_URL =
    "http://localhost:8080/payment-methods";

export const getPaymentMethods =
    async () => {

        const response =
            await api.get(API_URL);

        return response.data;
    };