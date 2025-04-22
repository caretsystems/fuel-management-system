import React, { useState, useEffect, lazy, use } from "react";
import { useParams,useLocation } from "react-router-dom";
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
  fetchfuelDeliveryStationedItems,
  fetchfuelDeliveryItems,
  fetchfuelDeliveryItem,
  createfuelDeliveryItem,
  updatefuelDeliveryItem, 
} from "~/Hooks/FuelManagement/FuelDelivery/useFuelDeliveryItem";

import { 
  fetchfuelDeliveryAttachments,
  addFuelDeliveryAttachment ,
  deletefuelDeliveryAttachment
} from "~/Hooks/FuelManagement/FuelDelivery/useFuelDeliveryAttachment"; 
 

const FuelDeliveryEdit = () => { 

  const { fuelDeliveryId } = useParams();
  const location = useLocation();
  const fuelDelivery = location.state || {};

  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [selectedStation, setSelectedStation] = useState(fuelDelivery.stationId);
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

  
  const [isLoaded, setIsLoaded] = useState(false); 


   


  const  { 
    data: stations,
    isLoading: isLoadingStations,
    error: errorStations 
  } = useGetStationRecords('Stations'); 

  
  const [stationTanks, setStationTanks] = useState([]);
  const [fuelData,setFuelData] = useState([
    // { id: 1, name: "Fuel 1", fuel: "VPR", price: 72.5, color:`#FFFFF`, beginningDip: "14,284", endDip: "19,155", delivery: "5,000", grossIncrease: "4,871", interimSales: 51, shortOver: 0 },
    // { id: 2, name: "Fuel 2", fuel: "VPG", price: 70.4, color:`#FFFFF`, beginningDip: "", endDip: "", delivery: "", grossIncrease: "", interimSales: "", shortOver: "" },
    // { id: 3, name: "Fuel 3", fuel: "VPD", price: 69.6, color:`#FFFFF`, beginningDip: "", endDip: "", delivery: "", grossIncrease: "", interimSales: "", shortOver: "" },
  ]);
  
 
  // const getSavedStationTanks = async (fdId,stId) => {
  //   const response = await fetchfuelDeliveryStationedItems(fdId,stId);
  //   setStationTanks(response); 
  // };
 const getStationTanks = async (fdId,stId) => {
  console.log("getStationTanks", "Params", fdId,stId);
    try {
        const result = await fetchfuelDeliveryStationedItems(fdId,stId);
        console.log("getStationTanks", "Response", result);

        let tmpResultStationTanks = []
        for (let item of result) {
          tmpResultStationTanks.push({
                id: item.id,
                name: item.name,
                fuel: item.code,
                price: parseFloat(item.price??0),
                color: item.color,
                beginningdip: parseFloat(item.beginningdip??0),
                enddip: parseFloat(item.enddip??0),
                delivery: parseFloat(item.delivery??0),
                grossincrease: parseFloat(item.grossincrease??0),
                interimsales: parseFloat(item.interimsales??0),
                shortover: parseFloat(item.shortover??0),
                isError: false,
                errorMessage: '',
                stationId: stId
            })
            console.log("tmpResultStationTanks", item)
        }
        setFuelData(tmpResultStationTanks); 
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
    }
  };  

useEffect( () => {
    if (fuelDelivery) { 
      
      const effectiveDate = fuelDelivery.effectivedate
      ? new Date(fuelDelivery.effectivedate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]; // Fallback to today's date if undefined

      setDate(effectiveDate);
      setSelectedStation(fuelDelivery.stationid);
      setSelectedShiftManager(fuelDelivery.shiftmanagerid);
      setDeliveryNo(fuelDelivery.deliveryno);
      setHauler(fuelDelivery.hauler);
      setPlateNo(fuelDelivery.plateno);
      setDriver(fuelDelivery.driver);
      setSelectedStationManager(fuelDelivery.receiverid);
      setSelectedShift(fuelDelivery.shiftid);
      setAttachedFiles(fuelDelivery.attachments || []);
      setFuelData(fuelDelivery.items || []);
  
      
    }
  }, [fuelDelivery]);
  
  useEffect(() => {
    if(selectedStation){
        getStationTanks(fuelDeliveryId, selectedStation); 
    }
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
    if (field === "delivery" || field === "grossincrease") {
      const deliveryValue = parseFloat(updatedData[index].delivery.toString().replace(/,/g, "")) || 0;
      const grossIncreaseValue = parseFloat(updatedData[index].grossincrease.toString().replace(/,/g, "")) || 0;
      const interimSalesValue = deliveryValue - grossIncreaseValue;
      updatedData[index].interimsales = (interimSalesValue);

      // console.log( "deliveryValue", deliveryValue, "grossIncreaseValue", grossIncreaseValue, "interimSalesValue", interimSalesValue, formatNumber(interimSalesValue));
    }
  
    // Auto compute: End Dip - (Beginning Dip + Delivery) - Interim Sales
    if (field === "enddip" || field === "beginningdip" || field === "delivery") {
      const beginningDipValue = parseFloat(updatedData[index].beginningdip.toString().replace(/,/g, "")) || 0;
      const endDipValue = parseFloat(updatedData[index].enddip.toString().replace(/,/g, "")) || 0;
      const deliveryValue = parseFloat(updatedData[index].delivery.toString().replace(/,/g, "")) || 0;
      const interimSalesValue = parseFloat(updatedData[index].interimsales.toString().replace(/,/g, "") ) || 0;
  
      const shortOverValue = endDipValue - (beginningDipValue + deliveryValue) - interimSalesValue;
      updatedData[index].shortover = (shortOverValue);

      // console.log( "beginningDipValue", beginningDipValue, "endDipValue", endDipValue, "deliveryValue", deliveryValue, "interimSalesValue", interimSalesValue, "shortOverValue", shortOverValue);
    }

    setFuelData(updatedData);
  }
  
  const handleOpenModal = () => setIsAttachmentModalOpen(true);
  const handleCloseModal = () => setIsAttachmentModalOpen(false); 

  const handleSaveFuelDelivery = async() => {
    // console.log("Saving fuel delivery data:", fuelData); 
    console.log(stations, selectedStation, date, selectedShiftManager, deliveryNo, hauler, plateNo, driver);
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
      // const selectedStations = stations?.body?.filter((station) =>
      //   selectedStation.includes(station.id)
      // );

      
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
        const id = fuelDeliveryId;
        const response = await updatefuelDelivery(id, saveFuelHeader);
        // fuelDelivery = [...saveFuelHeader];   

        // delete all tank items and attachments then reinsert

        // const newFuelDeliveryId = response[0]?.id;       
        saveFuelTankItems(id);
        saveAttachedFiles(id);
 
        // console.log("Fuel delivery created successfully:", response, newFuelDeliveryId);
      }

      setNotification({
        message: "Fuel delivery created successfully!",
        type: "success",
        onConfirm: () => setNotification(null),
        onCancel: () => setNotification(null),
      });
      
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving fuel delivery:", error);
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

  const saveFuelTankItems = async (id) => {
    console.log("Saving fuel tank items:", fuelData);
    try {
      for (const item of fuelData) {
        const saveFuelItem = {
          fuelDeliveryId: id,
          tankId: item.id,
          price: item.price,
          beginningdip: item.beginningdip,
          enddip: item.enddip,
          delivery: item.delivery,
          grossincrease: item.grossincrease,
          interimsales: item.interimsales,
          shortover: item.shortover,
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
    if (backgroundColor) {
      const hex = backgroundColor?.replace("#", "");

      // Parse the RGB values
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      // Calculate the luminance
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Return white for dark backgrounds and black for light backgrounds
      return luminance > 0.5 ? "#000000" : "#FFFFFF";
    }
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
          <label className="block text-sm">Effective Date :</label>
          <input disabled={true} isDisabled={true} type="date" className="w-full border p-2 rounded" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Stations : </label>
                <Select
                    aria-label="Stations"
                    className="w-full" 
                    variant="bordered"
                    labelPlacement="outside" 
                    placeholder="Select"
                    selectionMode="single"  
                    selectedKeys={[selectedStation]}  
                    onChange={(e) => setSelectedStation(e.target.value)}
                    classNames={{ value: 'font-semibold text-gray-400' }} 
                    isDisabled={true}
                >
                    {stations?.body.map((item) => (
                          <SelectItem key={item?.id} textValue={item?.name} value={item?.id}> {item?.name} </SelectItem>
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
                    selectedKeys={[selectedShiftManager]}  
                    onChange={(e) => { setSelectedShiftManager(e.target.value);    }}
                    classNames={{ value: 'font-semibold text-gray-400' }}
                >
                    {shiftManager?.map((item) => (
                        <SelectItem key={item?.id}>{item?.name}</SelectItem>
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
                    selectedKeys={[selectedShift]}  
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
              value={deliveryNo}
            />
          </div>
          <div>
            <label className="block text-sm">Hauler</label>
            <input
              type="text"
              className="border px-2 py-1 rounded w-full"
              onChange={(e) =>setHauler(e.target.value)}
              value={hauler}
            />
          </div>
          <div>
            <label className="block text-sm">Plate No.</label>
            <input
              type="text"
              className="border px-2 py-1 rounded w-full"
              onChange={(e) =>setPlateNo(e.target.value)}
              value={plateNo}
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
              value={driver}
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
                      selectedKeys={[selectedStationManager]}  
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
                    value={ formatNumber(row.beginningdip)}
                    onChange={(e) => handleInputChange(index, "beginningdip", e.target.value)}
                    placeholder="type here"
                  />
                </td>
                <td className="border p-2 text-center">
                  <input
                    type="text"
                    className="border px-2 py-1 rounded w-full"
                    value={formatNumber(row.enddip)}
                    onChange={(e) => handleInputChange(index, "enddip", e.target.value)}
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
                    value={formatNumber(row.grossincrease)}
                    onChange={(e) => handleInputChange(index, "grossincrease", e.target.value)}
                    placeholder="type here"
                  />
                </td>
                <td className="border p-2 text-center">
                  <input
                    type="text"
                    className="  px-2 py-1 rounded w-full"
                    style={{ backgroundColor: `#ededed`  }}
                    value={formatNumber(row.interimsales)}
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
                    value={formatNumber(row.shortover)}
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

export default FuelDeliveryEdit;
