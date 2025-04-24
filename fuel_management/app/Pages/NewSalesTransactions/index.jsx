import Tabs from "~/Components/Tabs";
import { SalesTabs } from "~/Constants/Labels";
import { useState, useEffect } from "react";
import Navbar from "~/Components/Navbar"
import SalesFilter from "./Components/SalesFilter";
import { DailySalesTable } from "./Pages/DailySalesTable";
import DailySalesInput from "./Pages/DailySalesInput";
import { fetchShiftList, fetchStationShifts, fetchStationShifts2, fetchStationShifts3 } from "~/Hooks/Setup/Station/StationShift/useStationShifts";
import { fetchStationEmployees, fetchStationShiftManagers, fetchStationEmployeesList, fetchStationUserList } from "~/Hooks/Setup/Station/StationEmployee/useStationEmployee";
import { fetchStations,fetchUserStations } from "~/Hooks/Setup/Station/Station/useStations";

import useAuth  from "~/Hooks/Auth/useAuth"; 

const SalesTransactions = () => {
    const [activeTab, setActiveTab] = useState(SalesTabs[0]);
    const [effectivityDate, setEffectivityDate] =  useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0]; // Format as "YYYY-MM-DD"
    });
    const [selectedMode, setSelectedMode] = useState(1)
    const [selectedStation, setSelectedStation] = useState('')
    const [selectedShiftManager, setSelectedShiftManager] = useState('')
    const [selectedShift, setSelectedShift] = useState('')
    const [openAdd, setOpenAdd] = useState(false);
    const [editId, setEditId] = useState('');
    const [shifts, setShifts] = useState([]);
    const [employee, setEmployees] = useState([]);
    const [shiftStationManagers, setShiftStationManagers] = useState([]);
    const { user } = useAuth(); 
    const [empStationList, setEmpStationList] = useState([]);
    
    const [stationList, setStationList] = useState([]);  
    const [shiftList, setShiftList] = useState([]);



    useEffect(()=> {
        setEmployees([{
            id: user?.id,
            description: user?.firstname + " " + user?.lastname 
        }])
        setSelectedShiftManager([user?.id])
        
        const getStationList = async () => {
            const result = await fetchUserStations(user?.id)
            let tempArray = [] 
            for (let item of result.body) {
                tempArray.push({
                    id: item.id,
                    name: item.name,
                    description: item.code
                }) 
            } 
            setStationList(tempArray) 
        } 
        getStationList();

        
        const getShiftList = async () => {
            const result = await fetchShiftList()
            let tempArray = [] 
            for (let item of result) {
                tempArray.push({
                    id: item.id,
                    description: item.name
                }) 
            } 
            setShiftList(tempArray)
        } 
        getShiftList();

        

    },[]);
 
    useEffect(() => {
        const getData = async () => {
            if (selectedStation !== '' && selectedStation !== undefined) {
                const result = await fetchStationShifts3(selectedStation)

                let tempArray = []
                for (let item of result) {
                    tempArray.push({
                        id: item.id,
                        description: item.name
                    })
                }
                setShifts(tempArray)

                const result2 =await fetchStationUserList(selectedStation)
                
                let tempArray2 = []
                for (let item of result2) {
                    tempArray2.push({
                        id: item.id,
                        description: item.description
                    })
                }
                setEmployees(tempArray2) 

                
                if (selectedShift !== '' && selectedShift !== undefined) {
                    const res1 = await fetchStationShiftManagers(selectedStation, selectedShift) 
                    setShiftStationManagers(res1)
                    
                    const res2 = await fetchStationEmployees(selectedStation, selectedShift) 
                    setEmpStationList(res2)            
                }else{
                    const res2 = await fetchStationEmployeesList(selectedStation) 
                    setEmpStationList(res2)
                }
            }
        }        
        getData()
    }, [selectedStation, selectedShift])



    return (
        <>
            <Navbar
                title="Sales"
            />

            <div className="p-5 bg-white min-h-[100vh]">
                <Tabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    tabs={SalesTabs}
                />

                <SalesFilter
                    activeTab={activeTab}
                    effectivityDate={effectivityDate}
                    setEffectivityDate={setEffectivityDate}
                    selectedMode={selectedMode}
                    setSelectedMode={setSelectedMode}
                    selectedStation={selectedStation}
                    setSelectedStation={setSelectedStation}
                    selectedShiftManager={selectedShiftManager}
                    setSelectedShiftManager={setSelectedShiftManager}
                    selectedShift={selectedShift}
                    setSelectedShift={setSelectedShift}
                    openAdd={openAdd}
                    shifts={shifts}
                    setShifts={setShifts}
                    employee={employee}
                    setEmployees={setEmployees}
                    stationList={stationList}
                    setStationList={setStationList}
                />

                {activeTab === "Daily Sales Input" && (
                    <>
                        {openAdd === true ?
                            <DailySalesInput
                                editId={editId}
                                setOpenAdd={setOpenAdd}
                                selectedMode={selectedMode}
                                effectivityDate={effectivityDate}
                                selectedStation={selectedStation}
                                selectedShiftManager={selectedShiftManager}
                                selectedShift={selectedShift}
                                employee={empStationList}
                                shiftStationManagers={shiftStationManagers}
                            />
                            : 
                            <DailySalesTable
                                openAdd={openAdd}
                                setOpenAdd={setOpenAdd}
                                setSelectedStation={setSelectedStation}
                                effectivityDate={effectivityDate}
                                selectedMode={selectedMode}
                                selectedStation={selectedStation}
                                selectedShiftManager={selectedShiftManager}
                                selectedShift={selectedShift}
                                setEditId={setEditId}
                                employee={employee}                          
                                shiftList={shiftList}
                                stationList={stationList}
                            />
                        }
                    </>
                )}

                {activeTab === "Upload POS" && (
                    <>
                    </>
                )}
            </div>
        </>
    )

}

export default SalesTransactions;
