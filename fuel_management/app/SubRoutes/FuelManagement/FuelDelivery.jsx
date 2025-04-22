import React, { useState, useEffect, lazy } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router";
import { useGetStationRecords } from "~/Hooks/Setup/Station/useStationRecordsApi";
import { Input, Button, Spinner, Select, SelectItem, Modal,     ModalContent,     ModalHeader,     ModalBody,     ModalFooter     } from "@heroui/react"; 

import StringRoutes from "~/Constants/StringRoutes";
import Notification from "~/Components/Notification";
import FuelDeliveryAttachment from "./FuelDeliveryAttachment";
import UploadArea from "./Components/UploadArea"; 

import { fetchFuelMasters } from "~/Hooks/Setup/GlobalRecords/FuelMaster/useFuelMasters";
import { fetchStationTanks } from "~/Hooks/Setup/Station/StationTank/useStationTanks";
import { fetchStationEmployees, fetchStationShiftManagers, fetchStationStationManagers } from "~/Hooks/Setup/Station/StationEmployee/useStationEmployee";
import { fetchStationShifts, fetchStationShifts2 } from "~/Hooks/Setup/Station/StationShift/useStationShifts";

import { 
  fetchfuelDeliveries,
  fetchfuelDelivery,
  createfuelDelivery,
  updatefuelDelivery,
  deletefuelDelivery,
} from "~/Hooks/FuelManagement/FuelDelivery/useFuelDelivery";

import {
  fetchfuelDeliveryItems,
  fetchfuelDeliveryItem,
  createfuelDeliveryItem,
  updatefuelDeliveryItem, 
} from "~/Hooks/FuelManagement/FuelDelivery/useFuelDeliveryItem";

import { 
  addFuelDeliveryAttachment ,
  deletefuelDeliveryAttachment
} from "~/Hooks/FuelManagement/FuelDelivery/useFuelDeliveryAttachment"; 
 

const FuelDelivery = () => { 

  const [fuelDeliveryId, setFuelDeliveryId ] = useState(0); 

  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [selectedStation, setSelectedStation] = useState("");
  const [date, setDate] = useState( new Date().toISOString().split("T")[0] );  
  const [shiftManager, setShiftManager] = useState([]);
  const [stationManager, setStationManager] = useState([]); 
  const [selectedStationManager, setSelectedStationManager] = useState('')
  const [selectedShiftManager, setSelectedShiftManager] = useState('')
  const [selectedShift, setSelectedShift] = useState('')
  const [shifts, setShifts] = useState([]);  
  const [isLoading, setIsLoading] = useState(false); 
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
   
  const [deliveryNo, setDeliveryNo] = useState("");
  const [hauler, setHauler] = useState("");
  const [plateNo, setPlateNo] = useState("");
  const [driver, setDriver] = useState("");

  
  const [isSaving, setIsSaving] = useState(false); 
  
  const [attachedFiles, setAttachedFiles] = useState([]);



  const  { 
    data: stations,
    isLoading: isLoadingStations,
    error: errorStations 
  } = useGetStationRecords('Stations'); 

  
  const [fuelData,setFuelData] = useState([
    // { id: 1, name: "Fuel 1", fuel: "VPR", price: 72.5, color:`#FFFFF`, beginningDip: "14,284", endDip: "19,155", delivery: "5,000", grossIncrease: "4,871", interimSales: 51, shortOver: 0 },
    // { id: 2, name: "Fuel 2", fuel: "VPG", price: 70.4, color:`#FFFFF`, beginningDip: "", endDip: "", delivery: "", grossIncrease: "", interimSales: "", shortOver: "" },
    // { id: 3, name: "Fuel 3", fuel: "VPD", price: 69.6, color:`#FFFFF`, beginningDip: "", endDip: "", delivery: "", grossIncrease: "", interimSales: "", shortOver: "" },
  ]);
   
 const getStationTanks = async () => {
    try {
        const result = await fetchStationTanks(selectedStation);
        let tmpResultStationTanks = []
        for (let item of result) {
          tmpResultStationTanks.push({
                id: item.id,
                name: item.name,
                fuel: item.code,
                price: parseFloat(item.price??0),
                color: item.color,
                beginningDip: "0",
                endDip: "0",
                delivery: "0",
                grossIncrease: "0",
                interimSales: "0",
                shortOver: "0",
                isError: false,
                errorMessage: '',
                stationid: ''
            })
        }
        setFuelData(tmpResultStationTanks);
        console.log("fetchStationTanks", result, tmpResultStationTanks);
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
    }
  };



  useEffect(() => {
        // getFuelMasters();
        getStationTanks();
  }, [selectedStation]); 
    
  useEffect(() => {
      const getData = async () => {

        if (selectedStation !== '' && selectedStation !== undefined) {
          const result = await fetchStationStationManagers(selectedStation)
          let tmpResultShiftManagers = []
          for (let item of result) {
            tmpResultShiftManagers.push({
                  id: item.id,
                  name: item.description
              })
          }
          setShiftManager(tmpResultShiftManagers)
        }

        if (selectedShiftManager !== '' && selectedShiftManager !== undefined) {
          const result = await fetchStationShifts2(selectedStation, selectedShiftManager) 
          let tmpResultShifts = []
          for (let item of result) {
              tmpResultShifts.push({
                  id: item.id,
                  name: item.shift
              })
          }
          setShifts(tmpResultShifts)               
        }

        if ( (selectedStation !== '' && selectedStation !== undefined) && (selectedShift !== '' && selectedShift !== undefined) ) {
          const result = await fetchStationShiftManagers(selectedStation, selectedShift)
          let tmpResultStationManagers = []
          for (let item of result) {
            tmpResultStationManagers.push({
                  id: item.id,
                  name: item.description
              })
          }
          setStationManager(tmpResultStationManagers)
        }

      }
      getData()
  }, [selectedStation, selectedShiftManager, selectedShift] )


  const handleBack = () => { 
    navigate(-1);
  }

  const handleAttachement = () => {
    navigate(`/${StringRoutes.fuelDeliveryAttachment}/${fuelDeliveryId??0}`);
  };

  const handleInputChange = (index, field, value) => {
    // console.log("handleInputChange", index, field, value); 
    const updatedData = [...fuelData];
    updatedData[index][field] = value;

 
    //Auto compute. formula = (Delivery Value) - (Gross Increase)
    if (field === "delivery" || field === "grossIncrease") {
      const deliveryValue = parseFloat(updatedData[index].delivery.replace(/,/g, "")) || 0;
      const grossIncreaseValue = parseFloat(updatedData[index].grossIncrease.replace(/,/g, "")) || 0;
      const interimSalesValue = deliveryValue - grossIncreaseValue;
      updatedData[index].interimSales = (interimSalesValue);

      // console.log( "deliveryValue", deliveryValue, "grossIncreaseValue", grossIncreaseValue, "interimSalesValue", interimSalesValue, formatNumber(interimSalesValue));
    }
  
    // Auto compute: End Dip - (Beginning Dip + Delivery) - Interim Sales
    if (field === "endDip" || field === "beginningDip" || field === "delivery") {
      const beginningDipValue = parseFloat(updatedData[index].beginningDip.replace(/,/g, "")) || 0;
      const endDipValue = parseFloat(updatedData[index].endDip?.replace(/,/g, "")) || 0;
      const deliveryValue = parseFloat(updatedData[index].delivery?.replace(/,/g, "")) || 0;
      const interimSalesValue = parseFloat(updatedData[index].interimSales ) || 0;
  
      const shortOverValue = endDipValue - (beginningDipValue + deliveryValue) - interimSalesValue;
      updatedData[index].shortOver = (shortOverValue);

      // console.log( "beginningDipValue", beginningDipValue, "endDipValue", endDipValue, "deliveryValue", deliveryValue, "interimSalesValue", interimSalesValue, "shortOverValue", shortOverValue);
    }

    setFuelData(updatedData);
  }
  
  const handleOpenModal = () => setIsAttachmentModalOpen(true);
  const handleCloseModal = () => setIsAttachmentModalOpen(false); 

  const handleSaveFuelDelivery = async() => {
    // console.log("Saving fuel delivery data:", fuelData);  
    
    if (!selectedStation || !date || !selectedShiftManager || !deliveryNo || !hauler || !plateNo || !driver) {
      setNotification({
        message: "Please fill in all required fields.",
        type: "warning",
        onConfirm: () => setNotification(null),
        onCancel: () => setNotification(null),
      });
      return;
    }

    if (fuelData.length === 0) {
      setNotification({
        message: "No fuel data available.",
        type: "warning",
        onConfirm: () => setNotification(null),
        onCancel: () => setNotification(null),
      });
      return;
    }

    setIsSaving(true);
  
    try {
      const selectedStationIds = selectedStation.split(",").map((id) => id.trim()); // Convert to an array of IDs
      const selectedStations = stations?.body?.filter((station) =>
        selectedStationIds.includes(String(station.id)) // Ensure both are strings for comparison
      ); 
      for (const station of selectedStations) {
        const saveFuelHeader = {
          effectiveDate: date,
          stationId: station.id,
          shiftManagerId: selectedShiftManager,
          deliveryNo: deliveryNo,
          hauler: hauler,
          plateNo: plateNo,
          driver: driver,
          receiverId: selectedStationManager,
          shiftId: selectedShift,
        };
  
        // Await the response from the promise
        const response = await createfuelDelivery(saveFuelHeader);
  
        // Assuming the response is an array and you want the first item's ID
        const newFuelDeliveryId = response[0]?.id;
        setFuelDeliveryId(newFuelDeliveryId);        
        saveFuelTankItems(newFuelDeliveryId, station.id);
        saveAttachedFiles(newFuelDeliveryId);
 
        console.log("Fuel delivery created successfully:", response, newFuelDeliveryId);
      }

      setNotification({
        message: "Fuel delivery created successfully!",
        type: "success",
        onConfirm: () => {
          
          setTimeout(() => {
            setNotification(null)
            navigate(-1)
          },2000);
        },
        onCancel: () => setNotification(null),
      });
       
    } catch (error) {
      console.error("Error saving fuel delivery:", error);
      
        setNotification({
          message: "Error saving fuel delivery!",
          type: "error",
          onConfirm: () => setNotification(null),
          onCancel: () => setNotification(null),
        });
      
    }

    
    setIsSaving(false);
  };


  
    // Add Attachment
    const { 
      mutateAsync: addAttachment, 
      isLoading: isaddAttachment, 
      isSuccess: isaddAttachmentSuccess, 
      error: addaddAttachmentError 
    } = addFuelDeliveryAttachment('fuelDelivery');

  const saveAttachedFiles =  (id)  => {

    if (!attachedFiles || attachedFiles.length === 0) {
      console.error("No files uploaded.");
      return;
    }

    if (attachedFiles)
    {
      attachedFiles.forEach((file) => { 
        const formData = new FormData();
        formData.append("file", file.content); 

        addAttachment({fuelDeliveryId:id, payload:formData}).then((response) => {
          // console.log("saveAttachedFiles" , "Attachment added successfully:", response); 
        }
        ).catch((error) => {
          // console.error("saveAttachedFiles" , "Error adding attachment:", error); 
        }); 
      });

    } 

  };

  const saveFuelTankItems = async (id, stationId) => {
    console.log("Saving fuel tank items:", fuelData);
    try {
      for (const item of fuelData) {
        const saveFuelItem = {
          fuelDeliveryId: id,
          tankId: item.id,
          price: item.price,
          beginningDip: item.beginningDip,
          endDip: item.endDip,
          delivery: item.delivery,
          grossIncrease: item.grossIncrease,
          interimSales: item.interimSales,
          shortOver: item.shortOver,
          stationId: stationId,
        };
        // Await the response from the promise

        if ( parseFloat(item.price??0) === 0 && parseFloat(item.beginningDip??0) === 0 && parseFloat(item.endDip??0) === 0 && parseFloat(item.grossIncrease??0) === 0 ) {
          // console.log("Item is empty, skipping save:", item);
          continue; // Skip this item if all values are 0
        } 

        const response = await fetchfuelDeliveryItem(id, item.id);
        if (response.length > 0) {
          // If the item already exists, update it
          const itemId = response[0].id;
          await updatefuelDeliveryItem(id, itemId, saveFuelItem);
        } else { 
          // If the item doesn't exist, create it
          await createfuelDeliveryItem(id, saveFuelItem);
        }
        
         
 
      }
    } catch (error) {
      console.error("Error saving fuel delivery item:", error);
    }
  };


  const handleDeleteFuelDelivery = (id) => {
      const handleConfirm = async () => {
          console.log("Deleting fuel delivery with ID:", id);
          try {
              await deletefuelDelivery(id);
              await deletefuelDeliveryItem(id);
              await deletefuelDeliveryAttachment(id);
              setNotification({ message: "Record deleted successfully!", type: "success" });
              handleBack();  
          }
          catch (error) {
              setNotification({ message: "Failed to delete record.", type: "error" });
              console.error("Error deleting record:", error);
          }





          // try {
          //     await deleteFuelMaster(id);
  
          //     setIsEditing(false);
          //     setNotification({ message: "Record deleted successfully!", type: "success" });
          //     getFuelMasters(); 
          //     setFuels((prevFuels) => prevFuels.filter(fuel => fuel.id !== id)); 
          // } catch (error) {
          //     setNotification({ message: "Failed to delete record.", type: "error" });
          //     console.error("Error deleting record:", error);
          // }
      };
  
      const handleCancel = () => {
          setNotification(null);
      };
  
      setNotification(prev => ({
        ...prev, 
        message: "Are you sure you want to delete this record?",
        type: "delete",
        onConfirm: handleConfirm, 
        onCancel: handleCancel,  
      }));
    };
 

  const getForegroundColor = (backgroundColor) => {
    // Remove the "#" if it exists
    const hex = backgroundColor.replace("#", "");

    // Parse the RGB values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate the luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return white for dark backgrounds and black for light backgrounds
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  const formatNumber = (value) => {
    if (!value) return "0";
    const number = parseFloat(value.toString().replace(/,/g, "")); // Remove commas and parse as a number
    if (isNaN(number)) return value; // Return original value if it's not a valid number
    return new Intl.NumberFormat("en-US").format(number); // Format with commas
  };


  // console.log("fuel delivery data", attachedFiles);
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div>  
        <p>Creating a New Fuel Delivery</p> 
      </div>
      <br/>
      <br/>

      <Modal isOpen={isAttachmentModalOpen}  
              style={{ maxHeight: "80vh", minHeight: '50vh', minWidth: '50vw', maxWidth: '90vwh' }} 
              scrollBehavior={"inside"}
              onClose={handleCloseModal}
      >
        <ModalContent>
             <UploadArea files={attachedFiles} setFiles={setAttachedFiles}  />
        </ModalContent>
      </Modal>
  
        {notification && 
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)}
          onConfirm={notification.onConfirm} 
          onCancel={notification.onCancel}  
        />}

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm">Effective Date</label>
          <input type="date" className="w-full border p-2 rounded" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Stations</label>
                <Select
                    aria-label="Stations"
                    className="w-full" 
                    variant="bordered"
                    labelPlacement="outside" 
                    placeholder="Select"
                    selectionMode="single"
                    selectedKey={[selectedStation]} 
                    onChange={(e) => {
                      setSelectedStation(e.target.value);  
                    }}
                    classNames={{
                        value: 'font-semibold text-gray-400'
                    }}
                >
                    {stations?.body?.map((item) => (
                        <SelectItem key={item?.id}>{item?.name}</SelectItem>
                    ))}
                </Select> 
        </div>
        <div>
          <label className="block text-sm">Shift Manager</label>
                <Select
                    aria-label="Shift Manager"
                    className="w-full" 
                    variant="bordered"
                    labelPlacement="outside" 
                    placeholder="Select"
                    selectionMode="single"
                    selectedKey={[selectedShiftManager]} 
                    onChange={(e) => {
                      setSelectedShiftManager(e.target.value);  
                    }}
                    classNames={{
                        value: 'font-semibold text-gray-400'
                    }}
                >
                    {shiftManager?.map((item) => (
                        <SelectItem key={item?.id} value={item?.id}>{item?.name}</SelectItem>
                    ))}
                </Select> 
        </div>
        <div>
          <label className="block text-sm">Shift No.</label>
          <Select
                    aria-label="Shifts"
                    className="w-full" 
                    variant="bordered"
                    labelPlacement="outside" 
                    placeholder="Select"
                    selectionMode="single"
                    selectedKey={[selectedShift]} 
                    onChange={(e) => {
                      setSelectedShift(e.target.value);  
                    }}
                    classNames={{
                        value: 'font-semibold text-gray-400'
                    }}
                >
                    {shifts?.map((item) => (
                        <SelectItem key={item?.id}>{item?.name}</SelectItem>
                    ))}
          </Select>  
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm">Delivery Receipt No.</label>
            <input
              type="text"
              className="border px-2 py-1 rounded w-full"
              onChange={(e) =>setDeliveryNo(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm">Hauler</label>
            <input
              type="text"
              className="border px-2 py-1 rounded w-full"
              onChange={(e) =>setHauler(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm">Plate No.</label>
            <input
              type="text"
              className="border px-2 py-1 rounded w-full"
              maxLength={10}
              onChange={(e) =>setPlateNo(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm">Driver</label>
            <input
              type="text"
              className="border px-2 py-1 rounded w-full"
              onChange={(e) =>setDriver(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm">Receiver</label>            
            <Select
                      aria-label="Receiver"
                      className="w-full" 
                      variant="bordered"
                      labelPlacement="outside" 
                      placeholder="Select"
                      selectionMode="single"
                      selectedKey={[selectedStationManager]} 
                      onChange={(e) => {
                        setSelectedStationManager(e.target.value);  
                      }}
                      classNames={{
                          value: 'font-semibold text-gray-400'
                      }}
                  >
                      {stationManager?.map((item) => (
                          <SelectItem key={item?.id}>{item?.name}</SelectItem>
                      ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Tank Name</th>
              <th className="border p-2">Fuel</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Beginning Dip</th>
              <th className="border p-2">End Dip</th>
              <th className="border p-2">Delivery</th>
              <th className="border p-2">Gross Increase</th>
              <th className="border p-2">Interim Sales</th>
              <th className="border p-2">Short/Over</th>
            </tr>
          </thead>
          <tbody>
            {fuelData.map((row, index) => (
              <tr key={row.id}   className={row.isError ? "bg-red-200" : ""}    >
                <td className="border p-2 text-center">{row.name}</td>
                <td className="border p-2 text-center" style={{ backgroundColor: `${row.color}`, color: getForegroundColor(row.color) }} > {row.fuel} </td>
                <td className="border p-2 text-center">
                  <input
                    type="text"
                    className="border px-2 py-1 rounded w-full"
                    value={formatNumber(row.price)}
                    onChange={(e) => handleInputChange(index, "price", e.target.value)}
                    placeholder="type here"
                  />
                </td>
                <td className="border p-2 text-center">
                  <input
                    type="text"
                    className="border px-2 py-1 rounded w-full"
                    value={ formatNumber(row.beginningDip)}
                    onChange={(e) => handleInputChange(index, "beginningDip", e.target.value)}
                    placeholder="type here"
                  />
                </td>
                <td className="border p-2 text-center">
                  <input
                    type="text"
                    className="border px-2 py-1 rounded w-full"
                    value={formatNumber(row.endDip)}
                    onChange={(e) => handleInputChange(index, "endDip", e.target.value)}
                    placeholder="type here"
                  />
                </td>
                <td className="border p-2 text-center">
                  <input
                    type="text"
                    className="border px-2 py-1 rounded w-full"
                    value={formatNumber(row.delivery)}
                    onChange={(e) => handleInputChange(index, "delivery", e.target.value)}
                    placeholder="type here"
                  />
                </td>
                <td className="border p-2 text-center">
                  <input
                    type="text"
                    className="border px-2 py-1 rounded w-full"
                    value={formatNumber(row.grossIncrease)}
                    onChange={(e) => handleInputChange(index, "grossIncrease", e.target.value)}
                    placeholder="type here"
                  />
                </td>
                <td className="border p-2 text-center">
                  <input
                    type="text"
                    className="  px-2 py-1 rounded w-full"
                    style={{ backgroundColor: `#ededed`  }}
                    value={formatNumber(row.interimSales)}
                    //onChange={(e) => handleInputChange(row.id, "interimSales", e.target.value)}
                    placeholder="type here"
                    readOnly={true}
                  />
                </td>
                <td className="border p-2 text-center">
                  <input
                    type="text"
                    className="  px-2 py-1 rounded w-full"
                    style={{ backgroundColor: `#ededed`  }}
                    value={formatNumber(row.shortOver)}
                    //onChange={(e) => handleInputChange(row.id, "interimSales", e.target.value)}
                    placeholder="type here"
                    readOnly={true}
                  />
                </td> 
 
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" onClick={handleOpenModal}>+ Attachment</button>
      </div>
      <div className="flex justify-end items-center gap-2 mb-4">
        <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600" onClick={handleBack}>Back</button>
        {/* <button className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" onClick={handleDeleteFuelDelivery}>Delete</button> */}
        <button 
            className={`px-4 py-2 rounded-lg ${
            isSaving
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
            }`} 
            onClick={handleSaveFuelDelivery} 
            disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
        <button className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">View History</button>
      </div>
    </div>
  );
};

export default FuelDelivery;
