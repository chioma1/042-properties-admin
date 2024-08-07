import StatusCard from '../components/StatusCard';
import { SearchOutlined } from '@ant-design/icons';
import { DownloadOutlined } from '@ant-design/icons';
import { ReloadOutlined, MenuOutlined } from '@ant-design/icons';

import { Input, Space, Table, Popover, Spin, Pagination } from 'antd';
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
import CardBody from '@material-tailwind/react/CardBody';
import { Select } from 'antd';
import { fetchData } from '../services/Actions';
import { CSVLink, CSVDownload } from "react-csv";
import { UserColumn } from '../partials/Column';
import { useQuery } from "react-query";
import { useNavigate } from 'react-router-dom';

import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Card } from 'antd';
import { DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { addCommas } from '../utility/Utility';
import { QueryClient, QueryClientProvider, useMutation } from 'react-query';
import { postData } from '../services/Actions';



export default function Dashboard() {
  const { Meta } = Card;

  const [open, setOpen] = useState(false);
  const [cardData, setCardData] = useState({});
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [childrenDrawer, setChildrenDrawer] = useState(false);
  const { RangePicker } = DatePicker;
  const { Option } = Select;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [data, setData] = useState([]);
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
      searchValue: "femmydhayor@gmail.com",
      selectedValue: "email",
    },
  });

  const navigate = useNavigate();

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
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
      // width: '30%',
      ...getColumnSearchProps('firstName'),
      sorter: (a, b) => a.firstName - b.firstName,
      sortOrder: sortedInfo.columnKey === 'firstName' ? sortedInfo.order : null,
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
      // width: '30%',
      ...getColumnSearchProps('lastName'),
      sorter: (a, b) => a.age - b.age,
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      // width: '20%',
      ...getColumnSearchProps('phoneNumber'),
    },
    {
      title: 'E Mail',
      dataIndex: 'email',
      key: 'email',
      // width: '20%',
      ...getColumnSearchProps('email'),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Provider',
      dataIndex: 'provider',
      key: 'provider',
      ...getColumnSearchProps('provider'),
    },
    // {
    //   title: 'Referral',
    //   dataIndex: 'referralCode',
    //   key: 'referralCode',
    //   ...getColumnSearchProps('referralCode'),
    // },
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
          <Tooltip title="View User's Listings">

            <Button
              type="primary"
              onClick={() => { navigate("/users/single-user") }}
              size="small"
              style={{
                width: 80,
                height: 35,
                backgroundColor: "#07a58e",
                border: "#07a58e",
                borderRadius: 6
              }}
            >
              Listings
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
          <CSVLink filename={"Users-Huzz-file.csv"} data={data?.content}>
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
            <h2 className="text-white text-2xl">John Doe</h2>
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
      <div className="bg-gray-100">
        <div className="container mx-auto py-8">
          <div className="grid grid-cols-4 sm:grid-cols-12 gap-6 px-4">
            <div className="col-span-4 sm:col-span-3">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex flex-col items-center">
                  <img
                    src="https://randomuser.me/api/portraits/men/94.jpg"
                    className="w-32 h-32 bg-gray-300 rounded-full mb-4 shrink-0"
                  />
                  <h1 className="text-xl font-bold">Ekechi Deborah </h1>
                  <p className="text-gray-700">Real Estate Developer</p>
                  {/* <div className="mt-6 flex flex-wrap gap-4 justify-center">
                    <span
                      onClick={() => {
                        AppNotification("Success", "success", 'topRight', "Account Successfully Suspended")
                      }}
                      href="#"
                      className="bg-pink-500 hover:bg-blue-600 text-white py-2 px-4 rounded cursor-pointer"
                    >
                      Delete
                    </span>
                    <span
                      onClick={() => {
                        AppNotification("Success", "success", 'topRight', "Account Successfully Suspended")
                      }}
                      href="#"
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded cursor-pointer"
                    >
                      Suspend
                    </span>
                  </div> */}
                </div>
                {/* <hr className="my-6 border-t border-gray-300" /> */}
                {/* <div className="flex flex-col">
                  <span className="text-gray-700 uppercase font-bold tracking-wider mb-2">
                    Skills
                  </span>
                </div> */}
              </div>
            </div>
            <div className="col-span-4 sm:col-span-9">
              <div className="bg-white shadow rounded-lg p-6">
                {/* <h2 className="text-xl font-bold mb-4">About Me</h2>
                <p className="text-gray-700">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed finibus
                  est vitae tortor ullamcorper, ut vestibulum velit convallis. Aenean
                  posuere risus non velit egestas suscipit. Nunc finibus vel ante id
                  euismod. Vestibulum ante ipsum primis in faucibus orci luctus et
                  ultrices posuere cubilia Curae; Aliquam erat volutpat. Nulla
                  vulputate pharetra tellus, in luctus risus rhoncus id.
                </p> */}

                <h2 className="text-xl font-bold mt-6 mb-4">Sellers Listings</h2>






                <div className=" h-auto -mt-8">
                  <div className="container mx-auto max-w-full mt-16">
                    {status ? <>
                      <div className='flex items-center justify-center h-screen'>
                        <div className='text-center'>
                          <Spin loading={loading || ishandleApproveDeclineAdvertLoading} tip="Loading..." className={loading ? '' : 'hidden'} />
                        </div>
                      </div>
                    </> : <>

                      <div className="grid grid-cols-3 gap-8 px-4 mb-16">
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





              </div>
            </div>
          </div>
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
