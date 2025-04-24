import {Input, TimeInput} from "@heroui/react";

const SimpleInput = ({version, label, placeholder, icon, type, textAlign, initialValue, setInitialValue, isReadOnly}) => {

    return (
        <div>
            {version==1 && (
                //bordered without label
                <input 
                    type={type}
                    className={`bg-gray-50 border ${textAlign==="center" ? 'text-center' : ''} border-gray-300 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`} 
                    placeholder={placeholder} 
                    required 
                    value={initialValue}
                    onChange={(e)=>setInitialValue(e.target.value)}
                    onFocus={(e) => e.target.select()}
                />
            )}
            {version==2 && (
                //outside label
                <Input
                    label={label}
                    labelPlacement="outside"
                    placeholder={placeholder}
                    startContent={
                        <div className="pointer-events-none flex items-center">
                            <span className="text-default-400 text-small">{icon}</span>
                        </div>
                    }
                    type={type}
                    value={initialValue}
                    onValueChange={setInitialValue}
                    className="text-right"
                    onFocus={(e) => e.target.select()}
                />
            )}
            {version==3 && (
                <>
                    <label className="font-semibold text-gray-500">{label}</label>
                    <input 
                        type={type}
                        className={`bg-gray-100 rounded-md mt-1 font-semibold ${textAlign==="right" ? 'text-right' : ''} border-gray-300 text-gray-600 focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`} 
                        placeholder={placeholder} 
                        required 
                        value={initialValue}
                        onChange={(e)=>setInitialValue(e.target.value)}
                        readOnly={isReadOnly}
                        onFocus={(e) => e.target.select()}
                    />
                </>
            )}
            {version==4 && (
                //time input
                <>
                    <label className="font-semibold text-gray-500">{label}</label>
                    <TimeInput 
                        placeholder={placeholder} 
                        defaultValue={initialValue}
                        value={initialValue} 
                        onChange={setInitialValue}
                        minValue={'08:00'}
                        maxValue={'17:00'}
                    />
                </>
            )}
        </div>
    )
}

export default SimpleInput
