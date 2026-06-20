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

export const getSales = async () => {

    const response =
        await axios.get(
            `${API_URL}`
        );

    return response.data;
};