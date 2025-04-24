import { Select, SelectItem, Autocomplete, AutocompleteItem } from "@heroui/react";
import { useEffect, useState } from "react";


export default function SimpleSelect({ label, items, passedValue, toUpdate, isMultiple, isDisabled, allowSearch, allowSuggest, selectedKey }) {
    const [value, setValue] = useState(isMultiple ? [] : '');
    const [filteredItems, setFilteredItems] = useState(items);  



    useEffect(() => {
        if (passedValue !== undefined) {
            if (isMultiple) {
                setValue(
                    items
                        .filter((a) => passedValue.includes(a.id))
                        .map((a) => a.description)
                );
            }
            else if (allowSuggest){
                setValue(passedValue)
            }
            else {
                setValue(items.filter((a) => a.id == passedValue)[0]?.description);
            }
        } 

        // console.log("useEffect", value, items, passedValue)
    }, [passedValue])

    

    const handleInputChange = (inputValue) => {
        setValue(inputValue); // Update the input value
        toUpdate(inputValue); // Pass the input value to the parent component

        // Filter suggestions based on the input
        const filtered = items.filter((item) =>
            item.description.toLowerCase().includes(inputValue.toLowerCase())
        );
        setFilteredItems(filtered);
    };

    const handleSelectionChange = (e) => { 

        if (isMultiple) {
            const selectedDescriptions = (e?.target?.value.split(",")) .map(
                (option) => option
            );
            const selectedIds = items
                .filter((a) => selectedDescriptions.includes(a.description))
                .map((a) => a.id);
            toUpdate(selectedIds); 
        } 
        else if (allowSearch)
        { 
            const selectedId = items.filter(
                (a) => a.description == e
            )[0]?.id;
            toUpdate(selectedId);
        }
        else if (allowSuggest)
        { 
            setValue(e); // Update the input value
            toUpdate(e); // Pass the selected value to the parent component
        }
        else {
            const selectedId = items.filter(
                (a) => a.description == e.target.value
            )[0]?.id;
            toUpdate(selectedId);
        }
    };

    // console.log("Label:",label,isDisabled, passedValue)
    return (
        <div className="flex flex-col justify-between">
            {label=="no-label"?(<label className="text-sm text-gray-500 font-semibold"></label>):(<label className="text-sm text-gray-500 font-semibold">{label}</label>)}
            <div className="mt-2 mb-1">
                 

                {isMultiple?(
                    <Select
                        aria-label={label}
                        className="w-full"
                        selectedKeys={ isMultiple ? [...value] :  value}
                        labelPlacement="outside"
                        onChange={handleSelectionChange}
                        selectionMode={isMultiple?"multiple":"single"}
                        placeholder="Select"
                        isDisabled={isDisabled}
                        classNames={{
                            value: 'font-semibold text-gray-400'
                        }}                    
                    >
                        {items.map((item) => (
                            <SelectItem key={item?.description} value={item?.description}>{item?.description}</SelectItem>
                        ))}
                    </Select>
                ): 
                    allowSearch?
                    (
                      <div className="flex w-full flex-wrap md:flex-nowrap gap-4"> 
                        <Autocomplete
                          className="w-full"
                          defaultItems={allowSuggest?filteredItems:items}
                          label={" "}
                          placeholder={allowSuggest? "Type to search..." : "Search ..." }                        
                          onInputChange={allowSuggest?(value) => handleInputChange(value): (value) => handleSelectionChange(value) }
                          onSelectionChange={(value) => handleSelectionChange(value)} 
                          allowsCustomValue={allowSuggest} 
                          value={selectedKey}
                          defaultSelectedKey={selectedKey}
                        >
                          {(item) => <AutocompleteItem key={item.description} value={item.description}>{item.description}</AutocompleteItem>}
                        </Autocomplete>
                      </div>
                    ) :
                    (
                        <Select
                            aria-label={label}
                            className="w-full"
                            selectedKeys={[value]} 
                            labelPlacement="outside"
                            onChange={handleSelectionChange}
                            selectionMode={"single"}
                            placeholder="Select"
                            isDisabled={isDisabled}
                            classNames={{
                                value: 'font-semibold text-gray-400'
                            }}                    
                        >
                            
                            
                            {items?.map((item) => (
                                <SelectItem key={item?.description} value={item?.description}>{item?.description}</SelectItem>
                            ))}
                        </Select>
                    )               
                
                }
            </div>
        </div>
    );
}