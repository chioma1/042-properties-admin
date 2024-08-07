import StatusCard from '../components/StatusCard';
import { SearchOutlined } from '@ant-design/icons';
import { DownloadOutlined } from '@ant-design/icons';
import { ReloadOutlined, MenuOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { Input, Space, Table, Popover, Spin } from 'antd';
import React, { useRef, useState, useEffect, Fragment } from 'react';
import Highlighter from 'react-highlight-words';
import SettingsForm from '../components/SettingsForm';
import ProfileCard from '../components/ProfileCard';
import { api } from '../apis/Api';
import AppNotification from "../utility/Notfication";
import AppDrawer from '../components/Drawer';
import CardHeader from '@material-tailwind/react/CardHeader';
import { Button, Tooltip, Modal } from 'antd';
import { DatePicker } from 'antd';
import moment from 'moment';
// import Card from '@material-tailwind/react/Card';
import CardBody from '@material-tailwind/react/CardBody';
import { Select } from 'antd';
import { CSVLink, CSVDownload } from "react-csv";
import { fetchData, postData } from '../services/Actions';
import { useMutation, useQuery } from "react-query";
import { NavLink, useParam } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

import { Pagination } from 'antd';

import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Card } from 'antd';
import { QueryClient, QueryClientProvider } from 'react-query';

import { addCommas } from '../utility/Utility';
const { Meta } = Card;
export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const [cardData, setCardData] = useState({});
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [childrenDrawer, setChildrenDrawer] = useState(false);
  const { RangePicker } = DatePicker;
  const { Option } = Select;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();



  const itemRender = (_, type, originalElement) => {
    if (type === 'prev') {
      return <a>Previous</a>;
    }
    if (type === 'next') {
      return <a>Next</a>;
    }
    return originalElement;
  };



  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchInput = useRef(null);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 12,
      total: 200,
      searchValue: "",
      selectedValue: "",
      from: "",
      to: "",
    },
    searchParams: {
      searchValue: "femmydhayor@gmail.com",
      selectedValue: "email",
    },
  });


  const onDateChange = (dates, dateStrings) => {
    if (dates) {
      // console.log('From: ', dates[0], ', to: ', dates[1]);
      // console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
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

  // const {
  //   mutate: handleApproveDeclineAdvert,
  //   isLoading: isContactMessageLoading,
  //   isSuccess: isContactMessageSuccess,
  //   error: isContactMessageError,
  //   data: APIresponse
  // } = useMutation(
  //   ["handleApproveDeclineAdvert", tableParams?.pagination, "/xxx"],
  //   postData, {
  //   onSuccess: (data) => {
  //     // Handle success if needed
  //     console.log('Mutation success:', data);
  //   },
  //   onError: (error) => {
  //     // Handle error if needed
  //     console.error('Mutation error:', error);
  //   },
  // });

  const queryClient = new QueryClient();

  const {
    mutate: handleApproveDeclineAdvert,
    isLoading: ishandleApproveDeclineAdvertLoading,
    isSuccess: ishandleApproveDeclineAdvertSuccess,
    error: ishandleApproveDeclineAdvertError,
    data: handleApproveDeclineAdvertResponse
  } = useMutation(
    ["handleApproveDeclineAdvert", tableParams?.pagination, "/xxx"], // Mutation key
    (payload) => postData({
      'advertStatus': payload.status
    }, `/management/advert/update/${payload.id}`), // Pass payload and apiUrl directly to postData function
    {
      onSuccess: (data) => {
        // Handle success if needed
        console.log('Mutation success:', data);
        AppNotification("Success", "success", 'topRight', "Advert Updated Successfully");
        queryClient.invalidateQueries("fetchAdverts");
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            total: 50,
          },
        });
      },
      onError: (error) => {
        // Handle error if needed
        console.error('Mutation error:', error);
        AppNotification("Oops", "error", 'topRight', "message");
      },
    }
  );



  // api Call
  const { data: responseData, isLoading: status, isError, } = useQuery(
    ["fetchAdverts", tableParams?.pagination, "/management/advert/list"],
    fetchData, {
    onError: (err) => {
      alert(err);
    },
  }, {
    keepPreviousData: true,
  }
  );

  useEffect(() => {
    if (status == true) {
      setLoading(true);
    }
    if (status == false) {
      setLoading(false);
    }
    if (isError) {
      setLoading(false);
      // alert(error)
    }
    if (responseData) {
      setLoading(false);
      setData(responseData);
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: responseData?.totalElements,
        },
      });
    }
  }, [responseData])



  const handlePaginationChange = (page, pageSize) => {
    setTableParams({
      pagination: {
        ...tableParams.pagination,
        current: page,
        pageSize: pageSize,
      },
    });
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
  const columns = [

    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: '20%',
      ...getColumnSearchProps('totalAmount'),
    },
    {
      title: 'transactionType',
      dataIndex: 'transactionType',
      key: 'transactionType',
      width: '20%',
      ...getColumnSearchProps('transactionType'),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Payment Mode',
      dataIndex: 'paymentMode',
      key: 'paymentMode',
      ...getColumnSearchProps('paymentMode'),
    },
    {
      title: 'Payment Source',
      dataIndex: 'paymentSource',
      key: 'paymentSource',
      ...getColumnSearchProps('paymentSource'),
    },
    {
      title: 'Enter Date',
      key: 'enterDateTimje',
      render: (_, record) => (
        moment(record.timeCreated).format('DD/MM/YYYY')
      ),
    },
    {
      title: 'Date Created',
      key: 'timeCreated',
      render: (_, record) => (
        moment(record.timeCreated).format('DD/MM/YYYY')
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View User">

            <Button
              type="primary"
              onClick={() => { setOpen(true); setCardData(record) }}
              icon={<SearchOutlined />}
              size="small"
              style={{
                width: 80,
                height: 35,
                backgroundColor: "#07a58e",
                border: "#07a58e",
                borderRadius: 6
              }}
            >
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];
  const options = columns.map(d => <Option value={d.key} key={d.key}>{d.title}</Option>)
  const popoverContent = (
    <div>
      <Card>
        <CardBody>
          <div className="grid gap-10 grid-cols-2">
            <Button
              onClick={() => {
                AppNotification("Success", "success", 'topRight', "You are logged in")
              }}
              style={{
                width: 120,
                backgroundColor: "green",
                border: "white",
                color: "white",
                borderRadius: 6
              }} className=" px-20" icon={<CheckOutlined />} >
              Approve
            </Button>
            <Button
              onClick={() => {
                AppNotification("Success", "success", 'topRight', "You are logged in")
              }}
              style={{
                width: 120,
                backgroundColor: "orangered",
                border: "white",
                color: "green",
                borderRadius: 6
              }} className=" bg-red-100 rounded-lg border text-white" icon={<DeleteOutlined />} >
              Decline
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
  const popoverContentMenu = (
    <div>
      <Card>
        <div className='flex'>
          <CSVLink filename={"Transactions-Huzz-file.csv"} data={data?.content}>
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



  // const [firstImageUrl, setFirstImageUrl] = useState('');

  // useEffect(() => {
  //   if (data && data.adverts && data.adverts.length > 0) {
  //     const advertImagesJson = data.adverts[0].advertImages;

  //     try {
  //       const advertImages = JSON.parse(advertImagesJson);
  //       if (advertImages.length > 0) {
  //         setFirstImageUrl(advertImages[0].url);
  //       }
  //     } catch (error) {
  //       console.error('Error parsing advert images JSON:', error);
  //     }
  //   }
  //   alert(firstImageUrl)
  // }, [data]);

  return (
    <>
      <div className='w-1/2 m-auto flex justify-center'>
        <CardHeader color="green" contentPosition="none">
          <div className="w-full flex items-center justify-between">
            <h2 className="text-white text-2xl">Adverts</h2>
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
      <div className="px-3 md:px-8 h-auto -mt-8">
        <div className="container mx-auto max-w-full mt-16">
          {status ? <>
            <div className='flex items-center justify-center h-screen'>
              <div className='text-center'>
                <Spin loading={loading || ishandleApproveDeclineAdvertLoading} tip="Loading..." className={loading ? '' : 'hidden'} />
              </div>
            </div>
          </> : <>

            <div className="grid grid-cols-4 gap-8 px-4 mb-16">
              {
                data?.adverts?.map((item, index) => (
                  <span key={index} onClick={() => { navigate(`single-advert?id=${item.id}`) }} className='cursor-pointer'>

                    <div className="col-span-1">
                      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                        <div style={{ width: '100%', height: '0', paddingBottom: '100%', position: 'relative' }}>
                          <img
                            alt="example"
                            src={JSON.parse(item.advertImages)[0].url}
                            className="absolute top-0 left-0 w-full h-full object-cover rounded-md"
                            style={{ objectFit: 'cover' }}
                            loading="lazy"
                          />
                        </div>
                        <div className="px-5 pb-5">
                          <a >
                            <h5 className=" mt-2 text-xl font-semibold tracking-tight text-gray-900 dark:text-white truncate overflow-hidden line-clamp-3">
                              {item?.advertTitle}
                            </h5>
                            <p className='truncate overflow-hidden line-clamp-2 text-gray-900' >{item?.advertDescription}</p>

                          </a>
                          <div className="flex items-center justify-between ">
                            <div></div>
                            <a
                              href="#"
                              className="text-gray-900 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5  text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            >
                              {item.advertStatus}
                            </a>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                              ₦{addCommas(item.advertPrice)}
                            </span>
                            {/* 
                            <a
                              href="#"
                              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            >
                              {item.advertStatus}
                            </a> */}
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-4 justify-between">
                            {(item.advertStatus == "Active") ? <>  <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleApproveDeclineAdvert({ 'id': item.id, 'status': "Decline" })
                              }}
                              loading={ishandleApproveDeclineAdvertLoading}

                              style={{
                                width: 120,
                                backgroundColor: "#ff6070",
                                border: "white",
                                color: "white",
                                borderRadius: 6,
                                width: "auto"

                              }} className=" rounded-lg border text-white px-0 mx-0 bg-blue-200" icon={<DeleteOutlined />} >
                              Decline
                            </Button> </> : <>                      <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleApproveDeclineAdvert({ 'id': item.id, 'status': "Active" })
                              }}
                              style={{
                                width: 120,
                                backgroundColor: "green",
                                border: "white",
                                color: "white",
                                borderRadius: 6,
                                width: "auto"
                              }}
                              loading={ishandleApproveDeclineAdvertLoading}
                              className=" px-20" icon={<CheckOutlined />} >
                              Approve
                            </Button> </>}


                            {(item.advertStatus == "Review") && <>  <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleApproveDeclineAdvert({ 'id': item.id, 'status': "Decline" })
                              }}
                              loading={ishandleApproveDeclineAdvertLoading}

                              style={{
                                width: 120,
                                backgroundColor: "#ff6070",
                                border: "white",
                                color: "white",
                                borderRadius: 6,
                                width: "auto"

                              }} className=" rounded-lg border text-white px-0 mx-0 bg-blue-200" icon={<DeleteOutlined />} >
                              Decline
                            </Button> </>}

                          </div>
                        </div>
                      </div>


                    </div>
                  </span>
                ))
              }



            </div >
          </>}


          <div className="mx-auto px-auto items-center flex justify-center mb-10">
            <Pagination
              current={tableParams.pagination.current}
              pageSize={tableParams.pagination.pageSize}
              total={tableParams.pagination.total}
              onChange={handlePaginationChange}
            />
          </div>
        </div >
      </div >

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
