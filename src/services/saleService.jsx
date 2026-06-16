import axios from "axios";

const API_URL =
    "http://localhost:8080/sales";

export const createSale =
    async (sale) => {

        const response =
            await axios.post(
                API_URL,
                sale
            );

        return response.data;
    };