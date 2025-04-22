import { apiClient } from "~/Constants/ApiClient";
import { endPoints } from "~/Constants/EndPoints";

const fetchStationShifts = async (stationId) => {
    try {
        const response = await apiClient.get(`${endPoints.Stations}/Station/${stationId}/Shifts`);

        return response.data;
    }
    catch (error) {
        throw error;
    }
};

const fetchStationShifts3 = async (stationId) => {
    try {
        const response = await apiClient.get(`${endPoints.Stations}/Station/${stationId}/Shifts2`);

        return response.data;
    }
    catch (error) {
        throw error;
    }
};

const fetchStationShifts2 = async (stationId, shiftmanagerid) => {
    try {
        const response = await apiClient.get(`${endPoints.Stations}/Station/${stationId}/${shiftmanagerid}/Shifts2`);

        return response.data;
    }
    catch (error) {
        throw error;
    }
};


export {
    fetchStationShifts,
    fetchStationShifts2, 
    fetchStationShifts3,
};