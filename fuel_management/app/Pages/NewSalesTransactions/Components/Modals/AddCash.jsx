import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
} from "@heroui/react";
import SimpleInput from "~/Components/SimpleInput"
import { PlusIcon } from 'lucide-react'
import { useState, useEffect } from "react";
import { CashRows } from "../Accordions/Rows/CashRows";
import CurrencyFormatter from "~/Components/Lib/CurrencyFormatter";
import SimpleSelect from "~/Components/SimpleSelect";
import { SampleEmployeeName } from "~/Constants/Labels";
import moment from "moment";

const AddCash = ({ openModal, setOpenModal, content, setContent, title, purpose, editData, setEditData, employee }) => {
    const tableHeader = [
        "Bills",
        "Quantity",
        "Amount"
    ]
    const [billsData, setBillsData] = useState([])
    const [totalAmount, setTotalAmount] = useState(0);
    const [time, setTime] = useState(() => {
        const now = new Date();
        return new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true, // Ensures 12-hour format with AM/PM
        }).format(now);
    });
    const [receivedBy, setReceivedBy] = useState('');

    useEffect(() => {
        const compute = () => {
            if (purpose === "edit" && editData!==undefined) {
                setBillsData(editData?.bills)
                setTotalAmount(editData?.total)
                setTime(editData?.time)
                setReceivedBy(editData?.recievedBy)
            } else {
                setBillsData([])
                setTotalAmount(0)
                setTime(null)
                setReceivedBy('')
            }
        }
        compute()
    }, [editData?.id, openModal])

    useEffect(() => {
        const compute = () => {
            let sum = billsData?.reduce((total, data) => {
                return total = total + (Number(data.bill)* Number(data.quantity))
            }, 0)
            setTotalAmount(sum)
        }
        compute()
    }, [billsData])

    const submitHandler = async () => {
        if (purpose === 'add') {
            let tempArray = content?.content.concat([
                {
                    id: content?.content.length,
                    bills: billsData,
                    total: totalAmount,
                    time: time,
                    recievedBy: receivedBy,
                }
            ])
            setContent({
                ...content,
                content: tempArray
            })
            
            setBillsData([])
            setTotalAmount(0)
            setTime(new Date(Date.now()))
            setReceivedBy('')
            setOpenModal(!openModal)
        } else if (purpose === 'edit') {
            let tempArray = content?.content.map((item) => {
                if (item?.id === editData?.id) {
                    return {
                        ...item,
                        bills: billsData,
                        total: totalAmount,
                        time: time,
                        recievedBy: receivedBy,
                    }
                }
                return item
            })
            setContent({
                ...content,
                content: tempArray
            })
            setBillsData([])
            setTotalAmount(0)
            setTime(new Date(Date.now()))
            setReceivedBy('')
            setOpenModal(!openModal)
        }
    }

    const handleDelete = () => {
        let tempArray = content?.content.filter((item) => item?.id !== editData?.id)
        setContent({
            ...content,
            content: tempArray
        })
        setBillsData([])
        setTotalAmount(0)
        setTime(new Date(Date.now()))
        setReceivedBy('')
        setOpenModal(!openModal)
    }

 
    return (
        <Modal
            isOpen={openModal}
            size={"xl"}
            scrollBehavior={"inside"}
            onClose={() => {
                setBillsData([])
                setTotalAmount(0)
                setTime(new Date(Date.now()))
                setReceivedBy('')
                setOpenModal(!openModal)
                setEditData(undefined)
            }}
            radius="none">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 text-gray-800">{title}</ModalHeader>
                <ModalBody className="px-10 pb-10">
                    <div className="w-full flex gap-4">
                        <label className="text-gray-500 text-base font-semibold">Cash Breakdown</label>
                        <Button
                            startContent={
                                <div className="h-4 w-4 flex items-center">
                                    <PlusIcon />
                                </div>
                            }
                            color="primary"
                            variant="flat"
                            className="font-semibold text-xs leading-3 rounded-md px-2"
                            onPress={() => {
                                setBillsData(prev => prev.concat({
                                    id: billsData.length,
                                    bill: '',
                                    quantity: 0,
                                    amount: 0
                                }))
                            }}
                        >
                            Add New
                        </Button>
                    </div>
                    <table className="h-full w-full">
                        <thead>
                            <tr className="">
                                {tableHeader.map((label, index) => {
                                    return <td className="p-2 text-gray-600 text-center text-sm font-semibold" key={index}>{label}</td>
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {billsData.map((item, index) => {
                                return (
                                    <tr key={index} className="">
                                        <CashRows
                                            index={index}
                                            data={item}
                                            content={billsData}
                                            setContent={setBillsData}
                                        />
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>

                    <div className="mt-8">
                        <label className="text-gray-500">Total Amount</label>
                        <p className="w-full text-left bg-gray-100 p-2 font-semibold rounded-md">{CurrencyFormatter(totalAmount)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-8 grid gap-1">
                            {/* <SimpleInput
                                version={4}
                                label={"Time"}
                                initialValue={time}
                                setInitialValue={setTime}
                            /> */}
                            <label className="text-gray-700">Time</label>
                            <input className="p-1.5 border-2 rounded-xl" min={'08:00'} max={'10:00'} type="time" value={time} onChange={(e)=>setTime(e.target.value)}/>
                        </div>
                        <div>
                            <SimpleSelect
                                label={"Received By"}
                                items={employee}
                                passedValue={receivedBy}
                                toUpdate={setReceivedBy}
                            />
                        </div>
                    </div>
                    <div>
                        <Button
                            variant={"flat"}
                            color="primary"
                            className="w-full rounded-md font-semibold text-base"
                        >
                            Verification
                        </Button>
                    </div>

                </ModalBody>
                <ModalFooter className="flex justify-between bg-gray-100">
                    <Button color="danger" variant="light" className="font-semibold text-base rounded-md" onPress={handleDelete}>
                        Delete
                    </Button>
                    <div className="flex item-center gap-2">
                        <Button color="primary" variant="light" className="font-semibold text-base rounded-md"
                            onPress={() => {
                                setBillsData([])
                                setTotalAmount(0)
                                setTime(new Date(Date.now()))
                                setReceivedBy('')
                                setOpenModal(!openModal)
                                setEditData(undefined)
                            }}
                        >
                            Close
                        </Button>
                        <Button onPress={() => submitHandler()} color="primary" variant="solid" className="font-semibold text-base rounded-md">
                            Save
                        </Button>
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal >
    )
}

export default AddCash