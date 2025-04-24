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

const AddCheck = ({ openModal, setOpenModal, content, setContent, title, purpose, editData, setEditData }) => {
    const [paymentForm, setPaymentForm] = useState('')
    const [bankNo, setBankNo] = useState('')
    const [amount, setAmount] = useState(0)
    const [details, setDetails] = useState('')
    const [checkNo, setCheckNo] = useState('')

    useEffect(() => {
        const compute = () => {
            if (purpose === "edit" && editData !== undefined) { 
                setPaymentForm(editData?.paymentForm)
                setCheckNo(editData?.checkno)
                setBankNo(editData?.bankno)
                setAmount(editData?.amount)
                setDetails(editData?.details)
            } else {
                setPaymentForm('')
                setBankNo('')
                setCheckNo('')
                setAmount(0)
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
                    paymentForm: paymentForm,
                    bankno: bankNo,
                    checkno: checkNo,
                    amount: Number(amount),
                    details: details
                }
            ])
            setContent({
                ...content,
                content: tempArray
            })
            setPaymentForm('')
            setBankNo('')
            setCheckNo('')
            setAmount(0)
            setDetails('')
            setOpenModal(!openModal)
        }
        else if (purpose === 'edit') {
            let tempArray = content?.content.map((item) => {
                if (item?.id === editData?.id) { 
                    return {
                        ...item,
                        paymentForm: paymentForm,
                        bankno: bankNo,
                        checkno: checkNo,
                        amount: Number(amount),
                        details: details
                    }
                }
                return item
            })
            setContent({
                ...content,
                content: tempArray
            })
            setPaymentForm('')
            setBankNo('')
            setCheckNo('')
            setAmount(0)
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
        setPaymentForm('')
        setBankNo('')
        setCheckNo('')
        setAmount(0)
        setDetails('')
        setOpenModal(!openModal)
    }

    return (
        <Modal
            isOpen={openModal}
            size={"xl"}
            scrollBehavior={"inside"}
            onClose={() => {
                setPaymentForm('')
                setBankNo('')
                setCheckNo('')
                setAmount(0)
                setDetails('')
                setOpenModal(!openModal)
                setEditData(undefined)
            }}
            radius="none">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 text-gray-800">{title}</ModalHeader>
                <ModalBody className="px-10 pb-10">
                    <div className="h-auto grid gap-4">
                        <SimpleInput
                            version={3}
                            label={"Check Payment Form"}
                            type={"text"}
                            initialValue={paymentForm}
                            setInitialValue={setPaymentForm}
                        />
                        <SimpleInput
                            version={3}
                            label={"Bank No."}
                            type={"text"}
                            initialValue={bankNo}
                            setInitialValue={setBankNo}
                        />
                        <SimpleInput
                            version={3}
                            label={"Check No."}
                            type={"text"}
                            initialValue={checkNo}
                            setInitialValue={setCheckNo}
                        />
                        <SimpleInput
                            version={3}
                            label={"Amount"}
                            type={"number"}
                            textAlign={"right"}
                            initialValue={amount}
                            setInitialValue={setAmount}
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
                                setPaymentForm('')
                                setBankNo('')
                                setCheckNo('')
                                setAmount(0)
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

export default AddCheck