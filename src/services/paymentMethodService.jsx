import axios from "axios";

const API_URL =
    "http://localhost:8080/payment-methods";

export const getPaymentMethods =
    async () => {

        const response =
            await axios.get(API_URL);

        return response.data;
    };