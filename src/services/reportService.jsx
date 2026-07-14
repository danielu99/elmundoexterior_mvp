import api from "./api";

export const getDashboard = async () => {

    const response = await api.get(
        `/reports/dashboard`
    );

    return response.data;
};

export const getSalesSummary = async () => {

    const response = await api.get(
        `/reports/sales-summary`
    );

    return response.data;
};

export const getMonthlySales = async (
    year,
    month
) => {

    const response = await api.get(
        `/reports/monthly-sales`,
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
        `/reports/pending-invoice-summary`,
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

    const response = await api.get(
        `/reports/pending-invoice-sales`,
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
            await api.get(
                `/reports/pending-invoice-sales/csv`,
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

export const markAsInvoiced =
    async (
        year,
        month
    ) => {

        const response =
            await api.post(
                `/reports/mark-invoiced?year=${year}&month=${month}`
            );

        return response.data;
    };