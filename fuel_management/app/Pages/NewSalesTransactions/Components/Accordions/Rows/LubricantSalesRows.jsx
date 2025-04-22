import { Button } from "@heroui/react";
import CurrencyFormatter from "~/Components/Lib/CurrencyFormatter";
import { Lubricants, SampleEmployeeName } from "~/Constants/Labels";

export const LubricantSalesRows = ({ currentData, content, setContent, setPurpose, setOpenAdd, setEditData, fuelLubes }) => {
    return (
        <>
            <td className="px-6 py-1">
                {currentData?.id + 1}
            </td>
            <td className="px-6 py-1">
                {fuelLubes.filter((item)=>item.id==currentData?.lubricant)[0]?.description}
            </td>
            <td className="px-6 py-1">
                {currentData?.quantity}
            </td>
            <td className="px-6 py-1">
                {CurrencyFormatter(currentData?.amount)}
            </td>
            <td className="px-6 py-1">
                {SampleEmployeeName.filter((item)=>item.id==currentData?.soldBy)[0]?.description}
            </td>
            <td className="py-1">
                <Button
                    className="rounded-md font-semibold text-base"
                    color="primary"
                    variant="flat"
                    size="sm"
                    onPress={() => {
                        setEditData(currentData)
                        setPurpose('edit')
                        setOpenAdd(true)
                    }}
                >
                    Edit
                </Button>
            </td>
        </>
    )
}