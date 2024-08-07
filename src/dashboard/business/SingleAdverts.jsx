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
    const popoverContent = (
        <div>
            <Card>
                <CardBody>
                    <form>
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
                    </form>
                </CardBody>
            </Card>
        </div>
    );
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
    return (
        <>

            <div className='w-1/2 m-auto flex justify-center'>
                <CardHeader color="green" contentPosition="none">
                    <div className="w-full flex items-center justify-between">
                        <h2 className="text-white text-2xl capitalize">Nicom Towers</h2>
                        <div>
                            <Tooltip title="Table Options">
                                <Popover content={popoverContent} title="Search and filter table" trigger="click">
                                    <Button style={{
                                        width: 90,
                                        backgroundColor: "white",
                                        border: "white",
                                        color: "green",
                                        borderRadius: 6
                                    }} className="ml-2 bg-042-green rounded-lg border text-white" icon={<SearchOutlined />} > Search</Button>
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
            <div className="px-3 md:px-8 h-auto -mt-24">
                <div className="container mx-auto max-w-full mt-16">



                    <section className="py-20 overflow-hidden bg-white font-poppins dark:bg-gray-800">
                        <div className="max-w-6xl px-4 py-4 mx-auto lg:py-8 md:px-6">
                            <div className="flex flex-wrap -mx-4">
                                <div className="w-full px-4 md:w-1/2 ">
                                    <div className="sticky top-0 z-50 overflow-hidden ">
                                        <div className="relative mb-6 lg:mb-10" style={{ height: 450 }}>
                                            <img
                                                src="data:image/jpeg;base64,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"
                                                alt=""
                                                className="object-contain w-full h-full "
                                            />
                                        </div>
                                        <div className="flex-wrap hidden md:flex ">
                                            <div className="w-1/2 p-2 sm:w-1/4">
                                                <a
                                                    href="#"
                                                    className="block border border-blue-100 dark:border-gray-700 dark:hover:border-gray-600 hover:border-blue-300 "
                                                >
                                                    <img
                                                        src="data:image/jpeg;base64,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"
                                                        alt=""
                                                        className="object-cover w-full lg:h-32"
                                                    />
                                                </a>
                                            </div>
                                            <div className="w-1/2 p-2 sm:w-1/4">
                                                <a
                                                    href="#"
                                                    className="block border border-blue-100 dark:border-transparent dark:hover:border-gray-600 hover:border-blue-300"
                                                >
                                                    <img
                                                        src="data:image/jpeg;base64,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"
                                                        alt=""
                                                        className="object-cover w-full lg:h-32"
                                                    />
                                                </a>
                                            </div>
                                            <div className="w-1/2 p-2 sm:w-1/4">
                                                <a
                                                    href="#"
                                                    className="block border border-blue-100 dark:border-transparent dark:hover:border-gray-600 hover:border-blue-300"
                                                >
                                                    <img
                                                        src="data:image/jpeg;base64,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"
                                                        alt=""
                                                        className="object-cover w-full lg:h-32"
                                                    />
                                                </a>
                                            </div>
                                            <div className="w-1/2 p-2 sm:w-1/4">
                                                <a
                                                    href="#"
                                                    className="block border border-blue-100 dark:border-transparent dark:hover:border-gray-600 hover:border-blue-300"
                                                >
                                                    <img
                                                        src="data:image/jpeg;base64,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"
                                                        alt=""
                                                        className="object-cover w-full lg:h-32"
                                                    />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full px-4 md:w-1/2 ">
                                    <div className="lg:pl-20">
                                        <div className="pb-6 mb-8 border-b border-gray-200 dark:border-gray-700">
                                            <span className="text-lg font-medium text-rose-500 dark:text-rose-200">
                                                New
                                            </span>
                                            <h2 className="max-w-xl mt-2 mb-6 text-xl font-bold dark:text-gray-300 md:text-4xl">
                                                Nicom Towers Surulere
                                            </h2>
                                            <div className="flex flex-wrap items-center mb-6">
                                                <ul className="flex mb-4 mr-2 lg:mb-0">
                                                    <li>
                                                        <a href="#">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width={16}
                                                                height={16}
                                                                fill="currentColor"
                                                                className="w-4 mr-1 text-red-500 dark:text-gray-400 bi bi-star "
                                                                viewBox="0 0 16 16"
                                                            >
                                                                <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z" />
                                                            </svg>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a href="#">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width={16}
                                                                height={16}
                                                                fill="currentColor"
                                                                className="w-4 mr-1 text-red-500 dark:text-gray-400 bi bi-star "
                                                                viewBox="0 0 16 16"
                                                            >
                                                                <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z" />
                                                            </svg>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a href="#">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width={16}
                                                                height={16}
                                                                fill="currentColor"
                                                                className="w-4 mr-1 text-red-500 dark:text-gray-400 bi bi-star "
                                                                viewBox="0 0 16 16"
                                                            >
                                                                <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z" />
                                                            </svg>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a href="#">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width={16}
                                                                height={16}
                                                                fill="currentColor"
                                                                className="w-4 mr-1 text-red-500 dark:text-gray-400 bi bi-star "
                                                                viewBox="0 0 16 16"
                                                            >
                                                                <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z" />
                                                            </svg>
                                                        </a>
                                                    </li>
                                                </ul>
                                                <a
                                                    className="mb-4 text-xs underline dark:text-gray-400 dark:hover:text-gray-300 lg:mb-0"
                                                    href="#"
                                                >
                                                    Be the first to review the product
                                                </a>
                                            </div>
                                            <p className="max-w-md mb-8 text-gray-700 dark:text-gray-400">
                                                Lorem ispum dor amet Lorem ispum dor amet Lorem ispum dor amet
                                                Lorem ispum dor amet Lorem ispum dor amet Lorem ispum dor amet
                                                Lorem ispum dor amet Lorem ispum dor amet
                                            </p>
                                            <div className="p-4 mb-8 border border-gray-300 dark:border-gray-700">
                                                <h2 className="mb-4 text-xl font-semibold dark:text-gray-400">
                                                    Real time{" "}
                                                    <span className="px-2 bg-blue-500 text-gray-50">26</span>
                                                    visitors right now!{" "}
                                                </h2>
                                                <div className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-400">
                                                    Hurry up! left 23 in Stock
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5  dark:bg-gray-600">
                                                    <div
                                                        className="bg-blue-600 dark:bg-blue-400 h-2.5 rounded-full"
                                                        style={{ width: "45%" }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <p className="inline-block text-2xl font-semibold text-gray-700 dark:text-gray-400 ">
                                                <span>#500,000.00</span>
                                                <span className="text-base font-normal text-gray-500 line-through dark:text-gray-400">
                                                    #760,000.00
                                                </span>
                                            </p>
                                        </div>
                                        <div className="mb-8">
                                            <h2 className="mb-2 text-xl font-bold dark:text-gray-400">Color</h2>
                                            <div className="flex flex-wrap -mb-2">
                                                <button className="p-1 mb-2 mr-2 border border-transparent rounded-full hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-400 ">
                                                    <div className="w-6 h-6 bg-red-600 rounded-full" />
                                                </button>
                                                <button className="p-1 mb-2 mr-2 border border-transparent rounded-full hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-400">
                                                    <div className="w-6 h-6 bg-green-600 rounded-full" />
                                                </button>
                                                <button className="p-1 mb-2 border border-transparent rounded-full hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-400">
                                                    <div className="w-6 h-6 bg-yellow-500 rounded-full" />
                                                </button>
                                                <button className="p-1 mb-2 border border-transparent rounded-full hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-400">
                                                    <div className="w-6 h-6 rounded-full bg-sky-400" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="pb-6 mb-8 border-b border-gray-300 dark:border-gray-700">
                                            <h2 className="mb-2 text-xl font-bold dark:text-gray-400">Size</h2>
                                            <div className="flex flex-wrap -mb-2">
                                                <button className="py-1 mb-2 mr-1 border w-11 hover:border-blue-400 dark:border-gray-400 hover:text-blue-600 dark:hover:border-gray-300 dark:text-gray-400">
                                                    XL
                                                </button>
                                                <button className="py-1 mb-2 mr-1 border w-11 hover:border-blue-400 hover:text-blue-600 dark:border-gray-400 dark:hover:border-gray-300 dark:text-gray-400">
                                                    S
                                                </button>
                                                <button className="py-1 mb-2 mr-1 border w-11 hover:border-blue-400 hover:text-blue-600 dark:border-gray-400 dark:hover:border-gray-300 dark:text-gray-400">
                                                    M
                                                </button>
                                                <button className="py-1 mb-2 mr-1 border w-11 hover:border-blue-400 hover:text-blue-600 dark:border-gray-400 dark:hover:border-gray-300 dark:text-gray-400">
                                                    XS
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center ">
                                            <div className="mb-4 mr-4 lg:mb-0">
                                                <div className="w-28">
                                                    <div className="relative flex flex-row w-full h-10 bg-transparent rounded-lg">
                                                        <button className="w-20 h-full text-gray-600 bg-gray-100 border-r rounded-l outline-none cursor-pointer dark:border-gray-700 dark:hover:bg-gray-700 dark:text-gray-400 hover:text-gray-700 dark:bg-gray-900 hover:bg-gray-300">
                                                            <span className="m-auto text-2xl font-thin">-</span>
                                                        </button>
                                                        <input
                                                            type="number"
                                                            className="flex items-center w-full font-semibold text-center text-gray-700 placeholder-gray-700 bg-gray-100 outline-none dark:text-gray-400 dark:placeholder-gray-400 dark:bg-gray-900 focus:outline-none text-md hover:text-black"
                                                            placeholder={1}
                                                        />
                                                        <button className="w-20 h-full text-gray-600 bg-gray-100 border-l rounded-r outline-none cursor-pointer dark:border-gray-700 dark:hover:bg-gray-700 dark:text-gray-400 dark:bg-gray-900 hover:text-gray-700 hover:bg-gray-300">
                                                            <span className="m-auto text-2xl font-thin">+</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mb-4 mr-4 lg:mb-0">
                                                <button className="w-full h-10 p-2 mr-4 bg-blue-500 dark:text-gray-200 text-gray-50 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500">
                                                    Buy Now
                                                </button>
                                            </div>
                                            <div className="mb-4 mr-4 lg:mb-0">
                                                <button className="flex items-center justify-center w-full h-10 p-2 text-gray-700 border border-gray-300 lg:w-11 hover:text-gray-50 dark:text-gray-200 dark:border-blue-600 hover:bg-blue-600 hover:border-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 dark:hover:border-blue-500 dark:hover:text-gray-300">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width={16}
                                                        height={16}
                                                        fill="currentColor"
                                                        className="bi bi-cart"
                                                        viewBox="0 0 16 16"
                                                    >
                                                        <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="mb-4 lg:mb-0">
                                                <button className="flex items-center justify-center w-full h-10 p-2 text-gray-700 border border-gray-300 lg:w-11 hover:text-gray-50 dark:text-gray-200 dark:border-blue-600 hover:bg-blue-600 hover:border-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 dark:hover:border-blue-500 dark:hover:text-gray-300">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width={16}
                                                        height={16}
                                                        fill="currentColor"
                                                        className=" bi bi-heart"
                                                        viewBox="0 0 16 16"
                                                    >
                                                        <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

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
