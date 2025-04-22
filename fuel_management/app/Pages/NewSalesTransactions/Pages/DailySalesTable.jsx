
import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import useGetDailySalesInput from "~/Hooks/Sales/useGetDailySalesInput";
import CustomTable from "../Components/CustomTable";
import { InputMode, Locations, SampleEmployeeName, Shifts } from "~/Constants/Labels";

export const DailySalesTable = ({
    openAdd,
    setOpenAdd,
    effectivityDate,
    selectedMode,
    selectedStation,
    selectedShiftManager,
    selectedShift,
    setEditId
}) => {
    const [dailySales, setDailySales] = useState([
        {
            ID: 0,
            effectivity_date : '',
            input_mode: "Zero",
            shift_id:"",
            employee_id: "",
            station_id: ""
        },
        {
            ID: 1,
            effectivity_date : '',
            input_mode: "One",
            shift_id:"",
            employee_id: "",
            station_id: ""
        },
    ])
    const columns = [
        { key: "effectivity_date", label: "Effectivity Date", hidden: true },
        { key: "input_mode", label: "Input Mode", hidden: false },
        { key: "station_id", label: "Station Code", hidden: false },
        { key: "shift_id", label: "Shift No.", hidden: false },
        { key: "employee_id", label: "Created By", hidden: false }
    ]

    useEffect(() => {
        const getData = async () => {
            const formattedDate = new Date(effectivityDate).toISOString().split("T")[0];
            const res = await useGetDailySalesInput(formattedDate, selectedStation)

            console.log("useGetDailySalesInput", res)

            if (res?.success === true) {
                const cleanData = res.message.map((item)=> {
                    return item = {
                        ID: item.ID,
                        effectivity_date: new Date(item.effectivity_date).toISOString().split("T")[0] ,
                        input_mode: InputMode.filter((mode)=> mode.id===item.input_mode)[0]?.description,
                        shift_id: Shifts.filter((shift)=> shift.id===item.shift_id)[0]?.description,
                        employee_id: SampleEmployeeName.filter((emp)=> emp.id===item.employee_id)[0]?.description,
                        station_id: Locations.filter((loc)=> loc.id===item.station_id)[0]?.description
                    }
                })
                setDailySales(cleanData)
            }
        }
        getData()
    }, [effectivityDate, selectedStation])

    const handleAdd = () => {
        setOpenAdd(true)
    }

    const handleEdit = (id) => {
        // setEditId(id)
        // setOpenAdd(true)
    }

    const customRender = {
        code: (value, row) => (
            <span className="px-3 py-1 text-white rounded-lg" style={{ backgroundColor: row.color }}>
                {value}
            </span>
        ),
        actions: (item) => (
            <Button
                onClick={() => handleEdit(item.ID)}
                className="bg-blue-200 text-blue-800 rounded-lg hover:bg-blue-300"
            >
                View
            </Button>
        ),
    };

    return (
        <CustomTable
            title=""
            data={dailySales}
            columns={columns}
            onEdit={handleEdit}
            onAdd={handleAdd}
            customRender={customRender}
        />
    )
}