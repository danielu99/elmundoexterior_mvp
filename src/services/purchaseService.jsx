import axios from "axios";

const API_URL =
    "http://localhost:8080/purchases";

export const createPurchase =
    async (purchase) => {

        const response =
            await axios.post(
                API_URL,
                purchase
            );

        return response.data;
    };

export const getPurchases =
    async () => {

        const response =
            await axios.get(
                API_URL
            );

        return response.data;
    };