import StatusCard from '../../components/StatusCard';
import { SearchOutlined } from '@ant-design/icons';
import { DownloadOutlined } from '@ant-design/icons';
import { ReloadOutlined, MenuOutlined } from '@ant-design/icons';

import { Input, Space, Table, Popover } from 'antd';
import { useRef, useState, useEffect, Fragment } from 'react';
import Highlighter from 'react-highlight-words';
import ProfileCard from '../../components/ProfileCard';
import { Api } from '../../apis/Api';
import AppNotification from "../../utility/Notfication";
import AppDrawer from '../../components/Drawer';
import CardHeader from '@material-tailwind/react/CardHeader';
import { Button, Tooltip, Modal } from 'antd';
import { DatePicker } from 'antd';
import moment from 'moment';
import Card from '@material-tailwind/react/Card';
import CardBody from '@material-tailwind/react/CardBody';
import { Select } from 'antd';
import { CSVLink, CSVDownload } from "react-csv";
import { CustomersColumns, DebtorsColumns, InvoicesColumns } from '../../partials/Column';
import { useQuery } from 'react-query';
import { fetchData } from '../../services/Actions';
import DynamicForm from '../../components/DynamicFields';




export default function Dashboard() {
    const [businessId, setBusinessId] = useState("63524703f9ca0a740b1149b9");
    const [columns, setColumns] = useState(CustomersColumns);

    const [open, setOpen] = useState(false);
    const [cardData, setCardData] = useState({});
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});
    const [childrenDrawer, setChildrenDrawer] = useState(false);
    const { RangePicker } = DatePicker;
    const { Option } = Select;

    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [data, setData] = useState([]);
    const [businessData, setBusinessData] = useState([]);
    const [tabValue, setTabValue] = useState("customer");
    const [loading, setLoading] = useState(true);
    const searchInput = useRef(null);

    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
            total: 200,
            searchValue: "",
            selectedValue: "",
            from: "",
            to: "",
        },
        searchParams: {
            searchValue: "",
            selectedValue: ""
        },

    });



    const onDateChange = (dates, dateStrings) => {
        if (dates) {
            setTableParams({
                ...tableParams,
                pagination: {
                    ...tableParams.pagination,
                    from: dateStrings[0] + " 00:00",
                    to: dateStrings[1] + " 00:00",
                },
            });
        } else {
            console.log('Clear');
        }
    };

    const showChildrenDrawer = () => {
        setChildrenDrawer(true);
    };

    const onChildrenDrawerClose = () => {
        setChildrenDrawer(false);
    };



    const fetchSingleBusinessData = async () => {
        let servicesExtraQuery = `${tabValue}?businessId=${businessId}`
        if (tabValue == 'service') {
            servicesExtraQuery = `product?businessId=${businessId}&productType=SERVICES`
        }
        setLoading(true)
        const data = await Api()
            .get(`/admin/business/${servicesExtraQuery}`)
            .then((data) => {
                if (data) {
                    AppNotification("Success", "success", 'topRight', data?.data?.message)
                    setLoading(false);
                    setData(data?.data?.data.content)
                    setTableParams({
                        ...tableParams,
                        pagination: {
                            ...tableParams.pagination,
                            total: 1000,
                        },
                    });
                }
            })
            .catch((error) => {
                setLoading(false);
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log(error.response);
                    let message = error?.response?.data?.error
                    if (!message) message = "Error fetching data";
                    AppNotification("Oops", "error", 'topRight', message + " " + error.response.status);
                } else if (error.request) {
                    console.log(error.request);
                    let message = error?.data?.message
                    if (!message) message = "Please Check Your Network"
                    AppNotification("Oops", "error", 'topRight', message);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', error.message);
                }
                console.log(error.config);
                return [];

            });
    };

    useEffect(() => {
        let paramString = window.location.href.split('?')[1];
        let queryString = new URLSearchParams(paramString);
        for (let pair of queryString.entries()) {
            setBusinessId(pair[1])
        }
        fetchSingleBusinessData();
    }, [JSON.stringify(tableParams?.pagination), tabValue]);

    useEffect(() => {
        const BusinessData = JSON.parse(localStorage.getItem("SingleBusiness"))
        setBusinessData(BusinessData);
        // fetchSingleBusinessData();
    }, []);

    const handleTableChange = (pagination, filters, sorter, searchParams) => {
        setTableParams({
            pagination,
            filters,
            searchParams,
            ...sorter,
        });
        setFilteredInfo(filters);
        setSortedInfo(sorter);
    };
    const onChange = (value) => {
        setTableParams({
            ...tableParams,
            pagination: {
                ...tableParams.pagination,
                selectedValue: value,
            },
        });
    };
    const onSelectedValueChange = (e) => {
        setTableParams({
            ...tableParams,
            pagination: {
                ...tableParams.pagination,
                searchValue: e.target.value,
                current: "",
            },
        });
    };
    const onSearch = (value) => {
        console.log('search:', value);
    };
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };
    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div
                style={{
                    padding: 8,
                }}
            >
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({
                                closeDropdown: false,
                            });
                            setSearchText(selectedKeys[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1890ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{
                        backgroundColor: '#ffc069',
                        padding: 0,
                    }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });
    const options = columns.map(d => <Option value={d.key} key={d.key}>{d.title}</Option>)

    const popoverContentMenu = (
        <div>
            <Card>
                <div className='flex'>
                    <CSVLink filename={"Users-Huzz-file.csv"} data={data}>
                        <Button style={{
                            width: 90,
                            backgroundColor: "white",
                            border: "white", color: "green",
                            borderRadius: 6
                        }} className="ml-2 bg-042-green rounded-lg border text-white" icon={<DownloadOutlined />} > Export</Button>
                    </CSVLink>
                    <Tooltip title="Refresh">
                        <Button onClick={() => {
                            setTableParams({
                                ...tableParams,
                                pagination: {
                                    ...tableParams.pagination,
                                    current: 1,
                                    pageSize: 10,
                                    total: "",
                                    searchValue: "",
                                    selectedValue: "",
                                    from: "",
                                    to: "",
                                },
                            });
                        }}
                            style={{
                                width: 90,
                                backgroundColor: "white",
                                border: "white", color: "green",
                                borderRadius: 6
                            }} className="ml-2 bg-042-green rounded-lg border text-huzz-green" icon={<ReloadOutlined />} > Refresh</Button>
                    </Tooltip>
                </div>

            </Card>
        </div>
    );


















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
        console.log(JSON.stringify(formValues, null, 2));
    };

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };


    const popoverContent = (
        <div>
            <Card>
                <CardBody>
                    {/* <form>
                        <h6 className="text-huzz-green text-sm mt-2 mb-2 font-light">
                            Search Table
                        </h6>
                        <div className="flex  mt-2">
                            <div className="w-full lg:w-6/12 mr-2 mb-2 font-light">
                                <Select
                                    showSearch
                                    placeholder="Select a person"
                                    optionFilterProp="children"
                                    onChange={onChange}
                                    onSearch={onSearch}
                                    style={{ width: 200 }}
                                >
                                    {options}
                                </Select>
                            </div>
                            <div className="w-full lg:w-6/12 ml-2 mb-2 font-light">
                                <Input
                                    type="text"
                                    color="purple"
                                    placeholder="Enter Search Value"
                                    onBlur={(e) => onSelectedValueChange(e)}
                                />
                            </div>
                        </div>
                        <h6 className="text-huzz-green mt-10 text-sm my-2 font-light">
                            Filter Table
                        </h6>
                        <div className="flex flex-wrap mt-2">
                            <div className="w-full lg:w-6/12 mb-2 font-light">
                                <Space direction="vertical" size={12}>
                                    <RangePicker
                                        ranges={{
                                            Today: [moment(), moment()],
                                            'This Month': [moment().startOf('month'), moment().endOf('month')],
                                            'This Quarter': [moment().startOf('quarter'), moment().endOf('quarter')],
                                            'This Year': [moment().startOf('year'), moment().endOf('year')],
                                        }}
                                        onChange={onDateChange}
                                    />
                                </Space>
                            </div>

                        </div>
                    </form> */}

                    <div className='grid grid-cols-3 gap-3'>
                        {Object.keys(fieldColors).map((fieldType, index) => (
                            <span
                                key={index}
                                onClick={() => addField(fieldType)}
                                className={`bg-${fieldColors[fieldType]}-500 text-white p-2 mr-2 cursor-pointer`}
                            >
                                Add {capitalizeFirstLetter(fieldType)} Field
                            </span>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
    return (
        <>
            <div className='w-1/2 m-auto flex justify-center'>
                <CardHeader color="green" contentPosition="none">
                    <div className="w-full flex items-center justify-between">
                        <h2 className="text-white text-2xl capitalize">Create Sub Category</h2>
                        <div>
                            <Tooltip title="Table Options">
                                <Popover content={popoverContent} title="Add Fields" trigger="click">
                                    <Button style={{
                                        width: 160,
                                        backgroundColor: "white",
                                        border: "white",
                                        color: "green",
                                        borderRadius: 6
                                    }} className="ml-2 bg-042-green rounded-lg border text-white" icon={<SearchOutlined />} > Add Fields</Button>
                                </Popover>
                            </Tooltip>
                            <Popover content={popoverContentMenu} title="More Table Options" trigger="click">
                                <Tooltip title="More Options">
                                    <Button style={{
                                        width: 50,
                                        backgroundColor: "white",
                                        border: "white", color: "green",
                                        borderRadius: 6
                                    }} className="ml-2 bg-042-green rounded-lg border text-white" icon={<MenuOutlined />} ></Button>
                                </Tooltip>
                            </Popover>
                        </div>
                    </div>
                </CardHeader>
            </div>

            <div className="mx-auto -mt-16">
                <div className="container mx-auto max-w-full mt-0">

                    {/* <DynamicForm /> */}

                    <div className="px-28">
                        <Card>
                            <CardBody>
                                <form>
                                    <br /><br />

                                    <h6 className="text-purple-500 text-sm mt-3 mb-6 font-light uppercase">
                                        User Information
                                    </h6>
                                    <div className="flex flex-wrap mt-2">
                                        <div className="w-full lg:w-6/12 pr-4 mb-10 font-light">
                                            <input
                                                id="nameInput"
                                                type="text"
                                                placeholder="Name"
                                                className="p-2 mr-2  rounded w-full border border-slate-300"
                                            />
                                        </div>
                                        <div className="w-full lg:w-6/12 pl-4 mb-10 font-light">
                                            <div>
                                                <select id="parentCategory" className="p-2 mr-2 border rounded w-full border border-slate-300">
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
                                                        className="p-2 mr-2  rounded w-10/12 border border-slate-300"
                                                        disabled
                                                    />
                                                )}

                                                {(field.type === 'select' || (backendFieldTypes.find(f => f.type === field.type)?.isSelect)) && (
                                                    <div>
                                                        <select className="p-2 mr-2 rounded w-96 border border-slate-300">
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

                                    </div>

                                    <h6 className="text-purple-500 text-sm mb-6 font-light uppercase mt-10">
                                        User Information
                                    </h6>
                                    <div className=" mb-10 font-light mt-6 w-full">
                                        <span onClick={handleSubmit} className="bg-green-500 text-white p-2 cursor-pointer w-full mt-8">
                                            Submit
                                        </span>
                                    </div>
                                </form>

                            </CardBody>
                        </Card>
                    </div>



                    <br /><br /><br />

                </div>
            </div>

            <AppDrawer
                open={open}
                setOpen={setOpen}
                title={"User's Detail"}
                showChildrenDrawer={showChildrenDrawer}
                childrenDrawer={childrenDrawer}
                onChildrenDrawerClose={onChildrenDrawerClose}>
                <ProfileCard
                    cardData={cardData}
                    showChildrenDrawer={showChildrenDrawer} />
            </AppDrawer>

        </>
    );
}


