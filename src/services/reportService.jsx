import api from "./api";

const API_URL = "http://localhost:8080";

export const getDashboard = async () => {

    const response = await api.get(
        `${API_URL}/reports/dashboard`
    );

    return response.data;
};

export const getSalesSummary = async () => {

    const response = await api.get(
        `${API_URL}/reports/sales-summary`
    );

    return response.data;
};

export const getMonthlySales = async (
    year,
    month
) => {

    const response = await api.get(
        `${API_URL}/reports/monthly-sales`,
        {
            params: {
                year,
                month
            }
        }
    );

    return response.data;
};

export const getPendingInvoiceSummary = async (
    year,
    month
) => {

    const response = await api.get(
        `${API_URL}/reports/pending-invoice-summary`,
        {
            params: {
                year,
                month
            }
        }
    );

    return response.data;
};

export const getPendingInvoiceSales = async (
    year,
    month
) => {

    const response = await axios.get(
        `${API_URL}/reports/pending-invoice-sales`,
        {
            params: {
                year,
                month
            }
        }
    );

    return response.data;
};

export const exportPendingInvoiceSalesCsv =
    async (year, month) => {

        const response =
            await axios.get(
                `${API_URL}/reports/pending-invoice-sales/csv`,
                {
                    params: {
                        year,
                        month
                    },
                    responseType: "blob"
             }
        );

        return response.data;
};