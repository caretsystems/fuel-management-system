import { Button } from "@heroui/react"
import { ArrowRight, Plus } from 'lucide-react';

const ActionButtons = ({ 
    selectedMode, 
    submitHandler, 
    setOpenAdd, 
    disableAccordion
 }) => {
    return (
        <>
            {selectedMode == 3 && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <Button color="primary" className="w-full rounded-md font-semibold text-base" startContent={<ArrowRight />}>
                        Confirm Crew
                    </Button>
                    <Button color="primary" className="w-full rounded-md font-semibold text-sm" startContent={<ArrowRight />}>
                        SHOC & Recharge
                    </Button>
                    <Button color="primary" className="w-full rounded-md font-semibold text-sm" startContent={<ArrowRight />}>
                        Cashier - Forecourt
                    </Button>
                    <Button color="primary" className="w-full rounded-md font-semibold text-base" startContent={<ArrowRight />}>
                        Cashier - Select
                    </Button>
                    <Button color="primary" className="w-full rounded-md font-semibold text-base" startContent={<Plus />}>
                        Attachments
                    </Button>
                    <Button className="w-full rounded-md font-semibold text-base bg-emerald-400 text-white">
                        Variance Check
                    </Button>
                </div>
            )}
            <div className="md:flex grid grid-cols-3 gap-2 mt-4">
                <Button onPress={()=>setOpenAdd(false)} color="default" className="w-min rounded-md font-semibold text-base text-white">
                    Back
                </Button>
                <Button color="danger" className="w-min rounded-md font-semibold text-base text-white" isDisabled={true}>
                    Delete
                </Button>
                <Button onPress={submitHandler} color="primary" className="w-min rounded-md font-semibold text-base text-white" isDisabled={disableAccordion}>
                    Save
                </Button>
                <Button className="w-min rounded-md font-semibold text-base text-blue-600 bg-blue-200" isDisabled={disableAccordion}>
                    View History
                </Button>
            </div>
        </>
    )
}

export default ActionButtons