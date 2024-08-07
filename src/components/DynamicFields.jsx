import React, { useState, useEffect } from 'react';
import Card from '@material-tailwind/react/Card';
import CardHeader from '@material-tailwind/react/CardHeader';
import CardBody from '@material-tailwind/react/CardBody';
import Button from '@material-tailwind/react/Button';
import Input from '@material-tailwind/react/Input';
import Textarea from '@material-tailwind/react/Textarea';
const DynamicForm = () => {
    const [formFields, setFormFields] = useState([]);
    const [addedFieldTypes, setAddedFieldTypes] = useState([]);
    const [fieldColors, setFieldColors] = useState({});
    const predefinedColors = ['blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'];

    // Simulated backend response
    const backendFieldTypes = [
        { type: 'description', isSelect: false },
        { type: 'price', isSelect: false },
        { type: 'Advert Type', isSelect: true },
        { type: 'advertType', isSelect: false },
        { type: 'Location', isSelect: true }
    ];

    useEffect(() => {
        // Map field types to alternating colors
        const colors = {};
        backendFieldTypes.forEach((field, index) => {
            colors[field.type] = predefinedColors[index % predefinedColors.length];
        });
        setFieldColors(colors);
    }, []);

    const addField = (fieldType) => {
        if (addedFieldTypes.includes(fieldType)) {
            alert(`Error: ${fieldType} field already added.`);
            return;
        }

        const newField = { type: fieldType, options: [] };

        if (fieldType === 'select' || (backendFieldTypes.find(field => field.type === fieldType)?.isSelect)) {
            newField.options = [];
        }

        setFormFields([...formFields, newField]);
        setAddedFieldTypes([...addedFieldTypes, fieldType]);
    };

    const addOption = (index, option) => {
        const updatedFields = [...formFields];
        updatedFields[index].options.push(option);
        setFormFields(updatedFields);
    };

    const handleAddOption = (index) => {
        const option = prompt('Enter the option text:');
        if (option) {
            addOption(index, option);
        }
    };

    const deleteField = (index) => {
        const updatedFields = [...formFields];
        const removedType = updatedFields[index].type;
        updatedFields.splice(index, 1);
        setFormFields(updatedFields);
        setAddedFieldTypes(addedFieldTypes.filter(type => type !== removedType));
    };

    const handleSubmit = () => {
        // Construct JSON representation of form values
        const formValues = [
            // Include Name field
            {
                type: 'Name',
                value: document.querySelector('#nameInput').value,
            },
            // Include other fields
            ...formFields.map((field, index) => {
                const fieldValue =
                    field.type === 'select' || (backendFieldTypes.find(f => f.type === field.type)?.isSelect)
                        ? Array.from(document.querySelectorAll(`#field-${index} select option:checked`)).map(option => option.value)
                        : document.querySelector(`#field-${index} input, #field-${index} textarea, #field-${index} select`).value;

                return {
                    type: field.type,
                    value: fieldValue,
                };
            }),
            // Include parent category in the form values
            {
                type: 'Parent Category',
                value: document.querySelector('#parentCategory').value,
            },
        ];

        alert(JSON.stringify(formValues, null, 2));
    };

    return (
        <div className="ml-32 ">
            {Object.keys(fieldColors).map((fieldType, index) => (
                <span
                    key={index}
                    onClick={() => addField(fieldType)}
                    className={`bg-${fieldColors[fieldType]}-500 text-white p-2 mr-2 cursor-pointer`}
                >
                    Add {capitalizeFirstLetter(fieldType)} Field
                </span>
            ))}
            <br /> <br />
            <br /><br />
            <br /><br />
            <Card>
                <CardBody>
                    <form>
                        <h6 className="text-purple-500 text-sm mt-3 mb-6 font-light uppercase">
                            User Information
                        </h6>
                        <div className="flex flex-wrap mt-2">
                            <div className="w-full lg:w-6/12 pr-4 mb-10 font-light">
                                <input
                                    id="nameInput"
                                    type="text"
                                    placeholder="Name"
                                    className="p-2 mr-2 border rounded w-full"
                                />
                            </div>
                            <div className="w-full lg:w-6/12 pl-4 mb-10 font-light">
                                <div>
                                    <select id="parentCategory" className="p-2 mr-2 border rounded w-full">
                                        <option>Select Parent Category</option>
                                        {["Vehicle", "Real Estate"].map((option, optionIndex) => (
                                            <option key={optionIndex}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <h6 className="text-purple-500 text-sm mb-6 font-light uppercase">
                            Contact Information
                        </h6>
                        <div className=" mt-2">
                            {formFields.map((field, index) => (
                                <div key={index} className="mb-4 flex items-center w-12/12 pr-10" id={`field-${index}`}>
                                    {field.type !== 'select' && !(backendFieldTypes.find(f => f.type === field.type)?.isSelect) && (
                                        <input
                                            type="text"
                                            placeholder={field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                                            className="p-2 mr-2 border rounded w-10/12"
                                            disabled
                                        />
                                    )}

                                    {(field.type === 'select' || (backendFieldTypes.find(f => f.type === field.type)?.isSelect)) && (
                                        <div>
                                            <select className="p-2 mr-2 border rounded w-96">
                                                <option>Select...</option>
                                                {field.options.map((option, optionIndex) => (
                                                    <option key={optionIndex}>{option}</option>
                                                ))}
                                            </select>
                                            <span
                                                onClick={() => handleAddOption(index)}
                                                className="bg-gray-500 text-white p-2 cursor-pointer ml-3 rounded"
                                            >
                                                Add Option
                                            </span>
                                        </div>
                                    )}

                                    <span
                                        onClick={() => deleteField(index)}
                                        className="bg-pink-400 text-white p-2 ml-2 cursor-pointer rounded-md w-2/12 px-auto"
                                    >
                                        Delete Field
                                    </span>
                                </div>
                            ))}
                            <div className=" mb-10 font-light mt-2 w-36">
                                <span onClick={handleSubmit} className="bg-green-500 text-white p-2 cursor-pointer w-full mt-8">
                                    Submit
                                </span>
                            </div>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};

const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export default DynamicForm;