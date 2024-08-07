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
import { useLocation } from 'react-router-dom';
import { addCommas } from '../../utility/Utility';




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

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);


    const fetchSingleBusinessData = async () => {
        let servicesExtraQuery = `${tabValue}?businessId=${businessId}`
        if (tabValue == 'service') {
            servicesExtraQuery = `product?businessId=${businessId}&productType=SERVICES`
        }
        setLoading(true)
        const data = await Api()
            .get(`/management/advert/list/single?advertId=${searchParams.get('id')}`)
            .then((data) => {
                if (data) {
                    // AppNotification("Success", "success", 'topRight', data?.data?.message)
                    setLoading(false);
                    setData(data?.data?.data)
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




    return (
        <>

            <div className='w-1/2 m-auto flex justify-center'>
                <CardHeader color="green" contentPosition="none">
                    <div className="w-full flex items-center justify-between">
                        <h2 className="text-white text-2xl capitalize">{data?.advertTitle}</h2>
                        <div>

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
                                            {/* <img
                                                alt="example"
                                                src={JSON.parse(item.advertImages)[0].url}
                                                className="absolute top-0 left-0 w-full h-full object-cover rounded-md"
                                                style={{ objectFit: 'cover' }}
                                                loading="lazy"
                                            /> */}
                                            <img
                                                alt="example"
                                                src={data.advertImages ? JSON.parse(data?.advertImages)[0]?.url : ""}
                                                // className="absolute top-0 left-0 w-full h-full object-cover rounded-md"
                                                style={{ objectFit: 'cover' }}
                                                loading="lazy"
                                                className="object-contain w-full h-full rounded-md"
                                            />
                                        </div>
                                        <div className="flex-wrap hidden md:flex ">
                                            {data.advertImages && JSON.parse(data?.advertImages).map((item, index) => (
                                                <>
                                                    <div className="w-1/2 p-2 sm:w-1/4">
                                                        <a
                                                            href="#"
                                                            className="block border border-blue-100 dark:border-gray-700 dark:hover:border-gray-600 hover:border-blue-300 "
                                                        >
                                                            <img
                                                                loading='lazy'
                                                                src={item.url}
                                                                alt=""
                                                                className="object-cover w-full lg:h-32 rounded-sm"
                                                            />
                                                        </a>
                                                    </div></>
                                            ))}


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
                                                {data?.advertTitle}
                                            </h2>

                                            <p className="max-w-md mb-8 text-gray-700 dark:text-gray-400">
                                                {data?.advertDescription}
                                            </p>

                                            <p className="inline-block text-2xl font-semibold text-gray-700 dark:text-gray-400 ">
                                                <span>  ₦{data.advertPrice && addCommas(data.advertPrice)}</span>

                                            </p>
                                        </div>
                                        <div className="mb-8">
                                            <h2 className=" text-xl font-bold dark:text-gray-400">User Profile</h2>
                                            <div className="max-w-2xl mx-4 sm:max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-sm sm:mx-auto md:mx-auto lg:mx-auto xl:mx-auto mt-10 bg-white shadow-xl rounded-lg text-gray-900">
                                                <div className="rounded-t-lg h-32 overflow-hidden">
                                                    <img
                                                        className="object-cover object-top w-full"
                                                        src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ"
                                                        alt="Mountain"
                                                    />
                                                </div>
                                                <div className="mx-auto w-32 h-32 relative -mt-16 border-4 border-white rounded-full overflow-hidden">
                                                    <img
                                                        className="object-cover object-center h-32"
                                                        src={data?.user?.pictureUrl}
                                                        alt="Woman looking front"
                                                    />
                                                </div>
                                                <div className="text-center mt-2">
                                                    <h2 className="font-semibold">{data?.user?.fullNames}</h2>
                                                    <p className="text-gray-500">{data?.user?.phone}</p>
                                                </div>
                                                {/* <ul className="py-4 mt-2 text-gray-700 flex items-center justify-around">
                                                    <li className="flex flex-col items-center justify-around">
                                                        <svg
                                                            className="w-4 fill-current text-blue-900"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                                        </svg>
                                                        <div>2k</div>
                                                    </li>
                                                    <li className="flex flex-col items-center justify-between">
                                                        <svg
                                                            className="w-4 fill-current text-blue-900"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M7 8a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0 1c2.15 0 4.2.4 6.1 1.09L12 16h-1.25L10 20H4l-.75-4H2L.9 10.09A17.93 17.93 0 0 1 7 9zm8.31.17c1.32.18 2.59.48 3.8.92L18 16h-1.25L16 20h-3.96l.37-2h1.25l1.65-8.83zM13 0a4 4 0 1 1-1.33 7.76 5.96 5.96 0 0 0 0-7.52C12.1.1 12.53 0 13 0z" />
                                                        </svg>
                                                        <div>10k</div>
                                                    </li>
                                                    <li className="flex flex-col items-center justify-around">
                                                        <svg
                                                            className="w-4 fill-current text-blue-900"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M9 12H1v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6h-8v2H9v-2zm0-1H0V5c0-1.1.9-2 2-2h4V2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1h4a2 2 0 0 1 2 2v6h-9V9H9v2zm3-8V2H8v1h4z" />
                                                        </svg>
                                                        <div>15</div>
                                                    </li>
                                                </ul> */}
                                                <div className="p-4 border-t mx-8 mt-2">
                                                    <a href={`/users/single-user?id=${data?.userId}&image=${data?.user?.pictureUrl}&name=${data?.user?.fullNames}&phone=${data?.user?.phone}`} >
                                                        <button className="w-1/2 block mx-auto rounded-full bg-gray-900 hover:shadow-lg font-semibold text-white px-6 py-2">
                                                            View Profile
                                                        </button>
                                                    </a>

                                                </div>
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
