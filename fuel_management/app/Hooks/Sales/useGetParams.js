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


const fetchDiscountList = async () => {
    try {
        const response = await apiClient.get(
            `/SalesParams/DiscountList`
        );
        return response.data;
    }
    catch (error) {
        throw error;
    }
};


const fetchEmpChargeDescriptionList = async () => {
    try {
        const response = await apiClient.get(
            `/SalesParams/EmpChargeDescriptionList`
        );
        return response.data;
    }
    catch (error) {
        throw error;
    }
}; 

const fetchCustomerPlateNo = async (customerId) => {
    try {
        const response = await apiClient.get(
            `/SalesParams/getcustomerplateno/${customerId}`
        );
        return response.data;
    }
    catch (error) {
        throw error;
    }
};


const fetchPriceBasedonProduct = async (productid, category) => {
    try {
        const response = await apiClient.get(
            `/SalesParams/getpoamountbasedonproduct/${productid}/${category}`
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
    fetchInventoryCategoryList,
    fetchDiscountList,
    fetchEmpChargeDescriptionList,
    fetchCustomerPlateNo,
    fetchPriceBasedonProduct
};