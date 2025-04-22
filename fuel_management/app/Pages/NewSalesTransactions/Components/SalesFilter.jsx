import React, { useEffect, useState } from "react";
import CustomDatePicker from "~/Components/CustomDatePicker.jsx";
import { InputMode, SampleEmployeeName } from "~/Constants/Labels.js";
import SimpleDropdown from "~/Components/SimpleDropdown.jsx";
import SimpleSelect from "~/Components/SimpleSelect";
import { fetchStations,fetchUserStations } from "~/Hooks/Setup/Station/Station/useStations";
import useAuth  from "~/Hooks/Auth/useAuth"; 
const SalesFilter = ({
    activeTab,
    effectivityDate,
    setEffectivityDate,
    selectedMode,
    setSelectedMode,
    selectedStation,
    setSelectedStation,
    selectedShiftManager,
    setSelectedShiftManager,
    selectedShift,
    setSelectedShift,
    openAdd,
    shifts,
    setShifts,
    employee,
    setEmployees
}) => {
    const [stations, setStations] = useState([]);  
    const [selectedStationsValue, setSelectedStationsValue] = useState([]);     
    const { user } = useAuth(); 
 
    useEffect(() => {
        const getData = async () => {
            const result = await fetchUserStations(user?.id)
            let tempArray = []
            let tempStation = []
            for (let item of result.body) {
                tempArray.push({
                    id: item.id,
                    name: item.name,
                    description: item.code
                })
                tempStation.push(item.id)
            } 
            setStations(tempArray)
            setSelectedStation(tempStation); 
        } 
        getData();
        //req.user.username
    }, []) 

    // console.log("Selected station",selectedStation )

    return (
        <div className="grid xl:grid-cols-5 lg:grid-cols-4 sm:grid-cols-3 grid-cols-2 lg:gap-4 gap-2 my-4 items-center">
            {openAdd == true && (
                <SimpleSelect
                    label={"Input Mode"}
                    items={InputMode}
                    passedValue={selectedMode}
                    toUpdate={setSelectedMode}
                />
            )}

            <CustomDatePicker
                label={"Effectivity Date"}
                startDate={effectivityDate}
                setStartDate={setEffectivityDate}
            />

            <SimpleSelect
                label={"Station"}
                items={stations} 
                passedValue={selectedStation}
                toUpdate={setSelectedStation}
                isMultiple = { (openAdd == true?false:true) }
            />
            {openAdd == true && (
                <>
                    <SimpleSelect
                        label={"Shift No."}
                        items={shifts}
                        passedValue={selectedShift}
                        toUpdate={setSelectedShift}
                    />
                    <SimpleSelect
                        label={"Created by"}
                        items={employee}
                        passedValue={selectedShiftManager}
                        toUpdate={setSelectedShiftManager}
                        isDisabled={true}
                    />
                </>
            )}
        </div>
    );
};

export default SalesFilter;