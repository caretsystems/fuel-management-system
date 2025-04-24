import CurrencyFormatter from "~/Components/Lib/CurrencyFormatter";
import { Button } from "@heroui/react";
import { SampleEmployeeName } from "~/Constants/Labels";

export const RecievableRows = ({ currentData, content, setContent, setPurpose, setOpenAdd, setEditData, employeeList, empChargeDescriptionList }) => {

    return (
        <>
            <td className="px-6 py-1">
                {currentData?.id + 1}
            </td>
            <td className="px-6 py-1">
                {employeeList.filter((item)=>item.id==currentData?.employee)[0]?.description}
            </td>
            <td className="px-6 py-1">
                {CurrencyFormatter(currentData?.amount)}
            </td>
            <td className="px-6 py-1">
            {empChargeDescriptionList.filter((item)=>item.id==currentData?.description)[0]?.description}
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