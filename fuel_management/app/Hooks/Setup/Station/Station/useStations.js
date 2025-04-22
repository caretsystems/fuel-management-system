import { apiClient } from "~/Constants/ApiClient";
import { endPoints } from "~/Constants/EndPoints";
import { useQuery } from "@tanstack/react-query";
import { useParams } from 'react-router'

const useFetchStations = () => {
  return useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      const response = await apiClient.get(`${endPoints.Stations}/stations`);
      return response.data;
    }
  })
}

const useFetchStationId = (id) => {
  return useQuery({
    queryKey: ['stationid', id],
    queryFn: async () => {
      const response = await apiClient.get(`${endPoints.Stations}/stations/${id}`)
      return response.data;
    },
    enabled: false,
  })
}


const fetchUserStations = async (userId) => {
    try {
        const response = await apiClient.get(`${endPoints.Stations}/stations/${userId}/user`);

        return response.data;
    }
    catch (error) { 
        throw error;
    }
};

const fetchStations = async () => {
    try {
        const response = await apiClient.get(`${endPoints.Stations}/stations`);

        return response.data;
    }
    catch (error) { 
        throw error;
    }
};

const fetchStationDetails = async (id) => {
    try {
        const response = await apiClient.get(`${endPoints.Stations}/Stations/${id}`);

        return response.data;
    }
    catch (error) {
        throw error;
    }
};

const createStation = async (data) => {
    try {
        const response = await apiClient.post(`${endPoints.Stations}/Station`, data);

        return response.data;
    }
    catch (error) {
        throw error;
    }
};

const updateStation = async (id, data) => {
    try {
        const response = await apiClient.put(`${endPoints.Stations}/Station/${id}`, data);

        return response.data;
    }
    catch (error) {
        throw error;
    }
};

const deleteStation = async (id) => {
    try {
        const response = await apiClient.delete(`${endPoints.Stations}/Station/${id}`);

        return response.data;
    }
    catch (error) {
        throw error;
    }
};

export { 
    fetchUserStations,
    useFetchStations,
    useFetchStationId,
    fetchStations, 
    fetchStationDetails, 
    createStation, 
    updateStation, 
    deleteStation 
};
