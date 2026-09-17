import api from "./api";

export const getSaleExpenses = async (
    saleId
) => {

    const response =
        await api.get(
            `/sales/${saleId}/expenses`
        );

    return response.data;
};

export const createSaleExpense = async (
    saleId,
    expense
) => {

    const response =
        await api.post(
            `/sales/${saleId}/expenses`,
            expense
        );

    return response.data;
};