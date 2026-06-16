import axios from "axios";

const API_URL =
    "http://localhost:8080/sales-channels";

export const getSalesChannels =
    async () => {

        const response =
            await axios.get(API_URL);

        return response.data;
    };