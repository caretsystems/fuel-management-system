import SimpleInput from "~/Components/SimpleInput"
import ColorBGText from "~/Components/ColoredBGText"
import { Fuels } from "~/Constants/Labels"
import { useEffect, useState } from "react"

export const FuelInputRows = ({fuelData, fuelSales, setFuelSales}) => {
    const [price, setPrice] = useState(fuelData?.price)
    const [transCt, setTransCt] = useState(fuelData?.transCt)
    const [volume, setVolume] = useState(fuelData?.volume)
    const [amount, setAmount] = useState(fuelData?.amount)

    useEffect(() => {
        const compute = () => {
            if (fuelData!==undefined) {
                setPrice(fuelData?.price)
                setTransCt(fuelData?.transCt)
                setVolume(fuelData?.volume)
                setAmount(fuelData?.amount)
            } 
        }
        compute()
    }, [fuelData])

    useEffect(()=> {
        const updateFuelData = () => {
            let tempArray = fuelSales?.content.map((item) => {
                if (item?.fuelId === fuelData?.fuelId) { 
                    return {
                        ...item,
                        price: Number(price),
                        transCt: Number(transCt),
                        volume: Number(volume),
                        amount: Number(amount)
                    }
                }
                return item
            })
            setFuelSales({
                ...fuelSales,
                content: tempArray
            })
        }       
        updateFuelData()
    }, [transCt, volume, amount])

    return (
        <>
            <td className="px-8 fuelDatas-center">
                <ColorBGText 
                    text={fuelData.fuelName.toUpperCase()} 
                    color={fuelData.color} 
                />
            </td>
            <td className="px-8 fuelDatas-center">
                <SimpleInput
                    version={1}
                    label={''}
                    placeholder={"type here"}
                    icon={'₱'}
                    type={"number"}
                    textAlign={"center"}
                    initialValue={price}
                    setInitialValue={setPrice}
                />
            </td>
            <td className="px-8 fuelDatas-center">
                <SimpleInput
                    version={1}
                    label={''}
                    placeholder={"type here"}
                    icon={'₱'}
                    type={"number"}
                    textAlign={"center"}
                    initialValue={transCt}
                    setInitialValue={setTransCt}
                />
            </td>
            <td className="px-8 fuelDatas-center">
                <SimpleInput
                    version={1}
                    label={''}
                    placeholder={"type here"}
                    icon={'₱'}
                    type={"number"}
                    textAlign={"center"}
                    initialValue={volume}
                    setInitialValue={setVolume}
                />
            </td>
            <td className="px-8 fuelDatas-center">
                <SimpleInput
                    version={1}
                    label={''}
                    placeholder={"type here"}
                    icon={'₱'}
                    type={"number"}
                    textAlign={"center"}
                    initialValue={amount}
                    setInitialValue={setAmount}
                />
            </td>
        </>
    )
}