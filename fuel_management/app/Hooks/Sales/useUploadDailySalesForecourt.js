import {apiClient} from "~/Constants/ApiClient";

const useUploadDailySalesInputForecourt = async (data) => {
    try { 
        const response = await apiClient.post(
            `/ForecourtSales/dailySalesInputForecourt`,
            data,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );
        return response.data;
    }
    catch (error) {
        throw error;
    }
};

const saveCashAccordion = async (data) => {
    try {
        console.log("SAVING DATA",data)
        const response = await apiClient.post(
            `/ForecourtSales/saveCashAccordion`,
            data,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );
        return response.data;
    }
    catch (error) {
        throw error;
    }
};

export
{
    useUploadDailySalesInputForecourt,
    saveCashAccordion
}