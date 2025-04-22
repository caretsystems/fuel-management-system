import { apiClient } from "~/Constants/ApiClient";
import { endPoints } from "~/Constants/EndPoints";

const fetchStationEmployees = async (stationId, shiftId) => {
    try {
        const response = await apiClient.get(`${endPoints.Stations}/Station/${stationId}/${shiftId}/Employees`);

        return response.data;
    }
    catch (error) {
        throw error;
    }
};

const fetchStationStationManagers = async (stationId) => {
    try {
        const response = await apiClient.get(`${endPoints.Stations}/Station/${stationId}/ShiftManager`);

        return response.data;
    }
    catch (error) {
        throw error;
    }
};

const fetchStationShiftManagers = async (stationId, shiftId) => {
    try {
        const response = await apiClient.get(`${endPoints.Stations}/Station/${stationId}/${shiftId}/StationManager`);
        
        return response.data;
    }
    catch (error) {
        throw error;
    }
};



export {
    fetchStationEmployees,
    fetchStationShiftManagers, 
    fetchStationStationManagers
};