import {apiClient} from "~/Constants/ApiClient";

const fetchProductList = async () => {
    try {
        const response = await apiClient.get(
            `/SalesParams/ProductList`
        );
        return response.data;
    }
    catch (error) {
        throw error;
    }
};

const fetchPaymentModeList = async () => {
    try {
        const response = await apiClient.get(
            `/SalesParams/PaymentModeList`
        );
        return response.data;
    }
    catch (error) {
        throw error;
    }
};


const fetchInventoryCategoryList = async () => {
    try {
        const response = await apiClient.get(
            `/SalesParams/InventoryCategoryList`
        );
        return response.data;
    }
    catch (error) {
        throw error;
    }
};

export  {
    fetchProductList,
    fetchPaymentModeList,
    fetchInventoryCategoryList
};