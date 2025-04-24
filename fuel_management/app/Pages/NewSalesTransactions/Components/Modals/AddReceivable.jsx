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
import { DummyDesc, SampleEmployeeName } from "~/Constants/Labels";

const AddReceivable = ({ openModal, setOpenModal, content, setContent, title, purpose, editData, setEditData, employeeList, empChargeDescriptionList }) => {
    const [employee, setEmployee] = useState('')
    const [amount, setAmount] = useState(0)
    const [description, setDescription] = useState('')
    const [details, setDetails] = useState('') 

    useEffect(() => {
        const compute = () => {
            if (purpose === "edit" && editData !== undefined) {
                setEmployee(editData?.employee)
                setAmount(editData?.amount)
                setDescription(editData?.description)
                setDetails(editData?.details)
            } else {
                setEmployee('')
                setAmount(0)
                setDescription('')
                setDetails('')
            }
        }
        compute()
    }, [editData?.id, openModal])

    const submitHandler = async () => {
        if (purpose === 'add') {
            let tempArray = content?.content.concat([
                {
                    id: content?.content?.length,
                    employee: employee,
                    amount: Number(amount),
                    description: description,
                    details: details
                }
            ])
            setContent({
                ...content,
                content: tempArray
            })
            setEmployee('')
            setAmount(0)
            setDescription('')
            setDetails('')
            setOpenModal(!openModal)
        }
        else if (purpose === 'edit') {
            let tempArray = content?.content.map((item) => {
                if (item?.id === editData?.id) {
                    return {
                        ...item,
                        employee: employee,
                        amount: Number(amount),
                        description: description,
                        details: details
                    }
                }
                return item
            })
            setContent({
                ...content,
                content: tempArray
            })
            setEmployee('')
            setAmount(0)
            setDescription('')
            setDetails('')
            setOpenModal(!openModal)
        }
    }

    const handleDelete = () => {
        let tempArray = content?.content.filter((item) => item?.id !== editData?.id)
        setContent({
            ...content,
            content: tempArray
        })
        setEmployee('')
        setAmount(0)
        setDescription('')
        setDetails('')
        setOpenModal(!openModal)
    }

    return (
        <Modal
            isOpen={openModal}
            size={"xl"}
            scrollBehavior={"inside"}
            onClose={() => {
                setEmployee('')
                setAmount(0)
                setDescription('')
                setDetails('')
                setOpenModal(!openModal)
                setEditData(undefined)
            }}
            radius="none">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 text-gray-800">{title}</ModalHeader>
                <ModalBody className="px-10 pb-10">
                    <div className="h-auto grid gap-4">
                        <SimpleSelect
                            label={"Employee Name"}
                            items={employeeList}
                            passedValue={employee}
                            toUpdate={setEmployee}
                        />
                        <SimpleInput
                            version={3}
                            label={"Charge Amount"}
                            type={"number"}
                            textAlign={"right"}
                            initialValue={amount}
                            setInitialValue={setAmount}
                        />
                        <SimpleSelect
                            label={"Employee Charge Description"}
                            items={empChargeDescriptionList}
                            passedValue={description}
                            toUpdate={setDescription}
                        />
                        <SimpleInput
                            version={3}
                            label={"Details"}
                            type={"text"}
                            initialValue={details}
                            setInitialValue={setDetails}
                        />
                    </div>
                </ModalBody>
                <ModalFooter className="flex justify-between bg-gray-100">
                    <Button color="danger" variant="light" className="font-semibold text-base rounded-md" onPress={handleDelete}>
                        Delete
                    </Button>
                    <div className="flex item-center gap-2">
                        <Button color="primary" variant="light" className="font-semibold text-base rounded-md"
                            onPress={() => {
                                setEmployee('')
                                setAmount(0)
                                setDescription('')
                                setDetails('')
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

export default AddReceivable