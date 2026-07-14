import api from "./api";

const API_URL = "/products";

export const getProducts = async () => {

    const response =
        await api.get(API_URL);

    return response.data;
};

export const createProduct = async (product) => {

    const response = await api.post(
        API_URL,
        product
    );

    return response.data;
};