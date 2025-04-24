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

const AddDiscount = ({ openModal, setOpenModal, content, setContent, title, purpose, editData, setEditData, discountList }) => {
    const [discount, setDiscount] = useState('')
    const [quantity, setQuantity] = useState(0)
    const [amount, setAmount] = useState(0)

    useEffect(() => {
        const compute = () => {
            if (purpose === "edit" && editData !== undefined) {
                setDiscount(editData?.discount)
                setQuantity(editData?.quantity)
                setAmount(editData?.amount)
            } else {
                setDiscount('')
                setQuantity(0)
                setAmount(0)
            }
        }
        compute()
    }, [editData?.id, openModal])

    const submitHandler = async () => {
        if (purpose === 'add') {
            let tempArray = content?.content.concat([
                {
                    id: content?.content?.length,
                    discount: discount,
                    quantity: Number(quantity),
                    amount: Number(amount)
                }
            ])
            setContent({
                ...content,
                content: tempArray
            })
            setDiscount('')
            setQuantity(0)
            setAmount(0)
            setOpenModal(!openModal)
        } 
        else if (purpose === 'edit') {
            let tempArray = content?.content.map((item) => {
                if (item?.id === editData?.id) {
                    return {
                        ...item,
                        discount: discount,
                        quantity: Number(quantity),
                        amount: Number(amount)
                    }
                }
                return item
            })
            setContent({
                ...content,
                content: tempArray
            })
            setDiscount('')
            setQuantity(0)
            setAmount(0)
            setOpenModal(!openModal)
        }
    }

    const handleDelete = () => {
        let tempArray = content?.content.filter((item) => item?.id !== editData?.id)
        setContent({
            ...content,
            content: tempArray
        })
        setDiscount('')
        setQuantity(0)
        setAmount(0)
        setOpenModal(!openModal)
    }

    return (
        <Modal
            isOpen={openModal}
            size={"xl"}
            scrollBehavior={"inside"}
            onClose={() => {
                setDiscount('')
                setQuantity(0)
                setAmount(0)
                setOpenModal(!openModal)
                setEditData(undefined)
            }}
            radius="none">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 text-gray-800">{title}</ModalHeader>
                <ModalBody className="px-10 pb-10">
                    <div className="h-auto grid gap-4">
                        <SimpleSelect
                            label={"Discount Name"}
                            items={discountList}
                            passedValue={discount}
                            toUpdate={setDiscount}
                            allowSearch={true}
                        />
                        <SimpleInput
                            version={3}
                            label={"Quantity"}
                            type={"number"}
                            textAlign={"right"}
                            initialValue={quantity}
                            setInitialValue={setQuantity}
                        />
                        <SimpleInput
                            version={3}
                            label={"Amount"}
                            type={"number"}
                            textAlign={"right"}
                            initialValue={amount}
                            setInitialValue={setAmount}
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
                                setDiscount('')
                                setQuantity(0)
                                setAmount(0)
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

export default AddDiscount