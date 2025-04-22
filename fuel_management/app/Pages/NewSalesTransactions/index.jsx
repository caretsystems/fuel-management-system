import Tabs from "~/Components/Tabs";
import { SalesTabs } from "~/Constants/Labels";
import { useState, useEffect } from "react";
import Navbar from "~/Components/Navbar"
import SalesFilter from "./Components/SalesFilter";
import { DailySalesTable } from "./Pages/DailySalesTable";
import DailySalesInput from "./Pages/DailySalesInput";
import { fetchStationShifts, fetchStationShifts2, fetchStationShifts3 } from "~/Hooks/Setup/Station/StationShift/useStationShifts";
import { fetchStationEmployees, fetchStationShiftManagers } from "~/Hooks/Setup/Station/StationEmployee/useStationEmployee";
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



    useEffect(()=> {
        setEmployees([{
            id: user?.id,
            description: user?.firstname + " " + user?.lastname 
        }])
        setSelectedShiftManager([user?.id])
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
                
                if (selectedShift !== '' && selectedShift !== undefined) {
                    const res1 = await fetchStationShiftManagers(selectedStation, selectedShift) 
                    setShiftStationManagers(res1)
                    
                    const res2 = await fetchStationEmployees(selectedStation, selectedShift) 
                    // console.log("fetchStationEmployees",res2)
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
                                effectivityDate={effectivityDate}
                                selectedMode={selectedMode}
                                selectedStation={selectedStation}
                                selectedShiftManager={selectedShiftManager}
                                selectedShift={selectedShift}
                                setEditId={setEditId}
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
