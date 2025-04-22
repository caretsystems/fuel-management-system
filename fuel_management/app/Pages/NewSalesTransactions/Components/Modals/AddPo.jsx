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
import { PurchaseOrder, SampleEmployeeName } from "~/Constants/Labels"; 

const AddPo = ({ openModal, setOpenModal, content, setContent, title, purpose, editData, setEditData, productList, customerList }) => {
    const [invoiceNo, setInvoiceNo] = useState('')
    const [customerName, setCustomerName] = useState('')
    const [taxCode, setTaxCode] = useState('')
    const [custPONumber, setCustPONumber] = useState('')
    const [product, setProduct] = useState('')
    const [quantity, setQuantity] = useState(null)
    const [poAmount, setPoAmount] = useState(null)
    const [customers, setCustomers] = useState([])



    useEffect(() => {
        const compute = async () => {
            const formattedCustomers = customerList.map((customer) => ({
                id: customer.id,
                description: customer.name, // Adjust based on your API response
                taxCode: customer.taxCode
            }));
            setCustomers(formattedCustomers);
            

            if (purpose === "edit" && editData !== undefined) {
                setInvoiceNo(editData?.invoiceNo)
                setCustomerName(editData?.customerName)
                setTaxCode(editData?.taxCode)
                setProduct(editData?.product)
                setQuantity(editData?.quantity)
                setPoAmount(editData?.poAmount)
                setCustPONumber(editData?.custPONumber)
            } else {
                setInvoiceNo('')
                setCustomerName('')
                setTaxCode('')
                setProduct('')
                setQuantity(null)
                setPoAmount(null)
                setCustPONumber('')
            }
        }
        compute()
    }, [editData?.id, openModal])

    useEffect(()=>{
        if (customerName) {
            const selectedCustomer = customers.find((customer) => customer.id === customerName);
            if (selectedCustomer) {
                setTaxCode(selectedCustomer.taxCode); // Set the tax code based on the selected customer
            } else {
                setTaxCode(''); // Reset tax code if no match is found
            }
        }
    },[customerName])
    
    const submitHandler = async () => {
        if (purpose === 'add') {
            let tempArray = content?.content.concat([
                {
                    id: content?.content?.length,
                    invoiceNo: invoiceNo,
                    customerName: customerName,
                    taxCode: taxCode,
                    product: product,
                    quantity: Number(quantity),
                    poAmount: Number(poAmount),
                    custPONumber: custPONumber
                }
            ])
            setContent({
                ...content,
                content: tempArray
            })
            setInvoiceNo('')
            setCustomerName('')
            setTaxCode('')
            setProduct('')
            setQuantity(null)
            setPoAmount(null)
            setOpenModal(!openModal)
            setCustPONumber('')
        } 
        else if (purpose === 'edit') {
            let tempArray = content?.content.map((item) => {
                if (item?.id === editData?.id) {
                    return {
                        ...item,
                        invoiceNo: invoiceNo,
                        customerName: customerName,
                        taxCode: taxCode,
                        product: product,
                        quantity: Number(quantity),
                        poAmount: Number(poAmount),
                        custPONumber: custPONumber
                    }
                }
                return item
            })
            setContent({
                ...content,
                content: tempArray
            })
            setInvoiceNo('')
            setCustomerName('')
            setTaxCode('')
            setProduct('')
            setQuantity(null)
            setPoAmount(null)
            setOpenModal(!openModal)
            setCustPONumber('')
        }
    }

    const handleDelete = () => {
        let tempArray = content?.content.filter((item) => item?.id !== editData?.id)
        setContent({
            ...content,
            content: tempArray
        })
        setInvoiceNo('')
        setCustomerName('')
        setTaxCode('')
        setProduct('')
        setQuantity(null)
        setPoAmount(null)
        setOpenModal(!openModal)
        setCustPONumber('')
    }

    return (
        <Modal
            isOpen={openModal}
            size={"xl"}
            scrollBehavior={"inside"}
            onClose={() => {
                setInvoiceNo('')
                setCustomerName('')
                setTaxCode('')
                setProduct('')
                setQuantity(null)
                setPoAmount(null)
                setOpenModal(!openModal)
                setEditData(undefined)
                setCustPONumber('')
            }}
            radius="none">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 text-gray-800">{title}</ModalHeader>
                <ModalBody className="px-10 pb-10">
                    <div className="h-auto grid gap-4">
                        <SimpleInput
                            version={3}
                            label={"Invoice No."}
                            initialValue={invoiceNo}
                            setInitialValue={setInvoiceNo}
                        />
                        <SimpleSelect
                            label={"Customer Name"}
                            items={customers}
                            passedValue={customerName}
                            toUpdate={setCustomerName}
                        />
                        <SimpleInput
                            version={3}
                            label={"Tax Code"}
                            initialValue={taxCode}
                            setInitialValue={setTaxCode}
                            isReadOnly={true}
                        />
                        <SimpleInput
                            version={3}
                            label={"Customer PO No."}
                            initialValue={custPONumber}
                            setInitialValue={setCustPONumber}
                        />
                        <SimpleSelect
                            label={"Product"}
                            items={productList}
                            passedValue={product}
                            toUpdate={setProduct}
                            allowSearch={true}
                        />
                        <SimpleInput
                            version={3}
                            label={"Quantity"}
                            type={"number"}
                            initialValue={quantity}
                            setInitialValue={setQuantity}
                        />
                        <SimpleInput
                            version={3}
                            label={"PO Amount"}
                            type={"number"}
                            initialValue={poAmount}
                            setInitialValue={setPoAmount}
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
                                setInvoiceNo('')
                                setCustomerName('')
                                setTaxCode('')
                                setProduct('')
                                setQuantity(null)
                                setPoAmount(null)
                                setOpenModal(!openModal)
                                setEditData(undefined)
                                setCustPONumber('')
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

export default AddPo