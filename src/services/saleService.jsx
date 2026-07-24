import api from "./api";

const API_URL =
    "/sales";

export const createSale =
    async (sale) => {

        const response =
            await api.post(
                API_URL,
                sale
            );

        return response.data;
    };

export const getSales = async () => {

    const response =
        await api.get(
            `${API_URL}`
        );

    return response.data;
};

export const getSaleDetails =
    async (saleId) => {

        const response =
            await api.get(
                `${API_URL}/${saleId}/details`
            );

        return response.data;
    };

export const getSalesByDateRange =
    async (
        from,
        to
    ) => {

        const response =
            await api.get(
                `${API_URL}/history`,
                {
                    params: {
                        from,
                        to
                    }
                }
            );

        return response.data;
    };