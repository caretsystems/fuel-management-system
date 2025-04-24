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
import { fetchCustomerPlateNo, fetchPriceBasedonProduct } from "~/Hooks/Sales/useGetParams"

const AddLubricant = ({ openModal, setOpenModal, content, setContent, title, purpose, editData, setEditData, fuelLubes, employeeList }) => {
    const [lubricant, setLubricant] = useState('')
    const [quantity, setQuantity] = useState(0)
    const [amount, setAmount] = useState(0)
    const [discount, setDiscount] = useState(0)
    const [soldBy, setSoldBy] = useState('')


    useEffect(()=>{
        if(lubricant){             
            const getPriceBasedonProduct = async() =>{
                const result = await fetchPriceBasedonProduct(lubricant,"lube"); 
                setAmount(
                    result?.message.find((a)=>a.transid===lubricant)?.price
                    ); 
            } 
            getPriceBasedonProduct();
        }
    },[lubricant])


    useEffect(() => {
        const compute = () => {
            if (purpose === "edit" && editData !== undefined) {
                setLubricant(editData?.lubricant)
                setQuantity(editData?.quantity)
                setAmount(editData?.amount)
                setDiscount(editData?.discount)
                setSoldBy(editData?.soldBy)
            } else {
                setLubricant('')
                setQuantity(0)
                setAmount(0)
                setDiscount(0)
                setSoldBy('')
            }
        }
        compute()
    }, [editData?.id, openModal])

    const submitHandler = async () => {
        if (purpose === 'add') {
            let tempArray = content?.content.concat([
                {
                    id: content?.content?.length,
                    lubricant: lubricant,
                    quantity: Number(quantity),
                    soldBy: soldBy,
                    discount: Number(discount),
                    amount: Number(amount)
                }
            ])
            setContent({
                ...content,
                content: tempArray
            })
            setLubricant('')
            setQuantity(0)
            setAmount(0)
            setDiscount(0)
            setSoldBy('')
            setOpenModal(!openModal)
        }
        else if (purpose === 'edit') {
            let tempArray = content?.content.map((item) => {
                if (item?.id === editData?.id) {
                    return {
                        ...item,
                        lubricant: lubricant,
                        quantity: Number(quantity),
                        soldBy: soldBy,
                        discount: Number(discount),
                        amount: Number(amount)
                    }
                }
                return item
            })
            setContent({
                ...content,
                content: tempArray
            })
            setLubricant('')
            setQuantity(0)
            setAmount(0)
            setDiscount(0)
            setSoldBy('')
            setOpenModal(!openModal)
        }
    }

    const handleDelete = () => {
        let tempArray = content?.content.filter((item) => item?.id !== editData?.id)
        setContent({
            ...content,
            content: tempArray
        })
        setLubricant('')
        setQuantity(0)
        setAmount(0)
        setDiscount(0)
        setSoldBy('')
        setOpenModal(!openModal)
    }

    return (
        <Modal
            isOpen={openModal}
            size={"xl"}
            scrollBehavior={"inside"}
            onClose={() => {
                setLubricant('')
                setQuantity(0)
                setAmount(0)
                setDiscount(0)
                setSoldBy('')
                setOpenModal(!openModal)
                setEditData(undefined)
            }}
            radius="none">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 text-gray-800">{title}</ModalHeader>
                <ModalBody className="px-10 pb-10">
                    <div className="h-auto grid gap-4">
                        <SimpleSelect
                            label={"Lubricants"}
                            items={fuelLubes}
                            passedValue={lubricant}
                            toUpdate={setLubricant}
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
                            label={"Gross Amount"}
                            type={"number"}
                            textAlign={"right"}
                            initialValue={amount}
                            setInitialValue={setAmount}
                        />
                        {/* <SimpleInput
                            version={3}
                            label={"Manager Given Discount"}
                            type={"number"}
                            textAlign={"right"}
                            initialValue={discount}
                            setInitialValue={setDiscount}
                        /> */}
                        <SimpleSelect
                            label={"Sold By"}
                            items={employeeList}
                            passedValue={soldBy}
                            toUpdate={setSoldBy}
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
                                setLubricant('')
                                setQuantity(0)
                                setAmount(0)
                                setDiscount(0)
                                setSoldBy('')
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

export default AddLubricant