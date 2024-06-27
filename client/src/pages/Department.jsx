import React, { useState, useRef } from "react";
import Title from "../components/Title";
import { IoMdAdd } from "react-icons/io";
// import { summary } from "../assets/data";
import { getInitials } from "../utils";
import clsx from "clsx";
import ConfirmatioDialog, { UserAction } from "../components/Dialogs";
import AddUser from "../components/AddUser";
import { useGetTeamListQuery } from "../redux/slices/api/userApi";
import { toast } from "sonner";
import { Table, Button, Drawer, Space, Input, message } from "antd";
import {
  useDeleteDepartmentMutation,
  useGetDepartmentsQuery,
} from "../redux/slices/api/departmentApi";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import AddDepartment from "./../components/AddDepartment";
import Highlighter from "react-highlight-words";

const Department = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedToUpdate, setSelectedToUpdate] = useState(null);

  const { data, isLoading, refetch } = useGetDepartmentsQuery();
  const [deleteDepartment] = useDeleteDepartmentMutation();
  const { data: usersData } = useGetTeamListQuery();

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Tìm kiếm
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Hủy
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
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
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const deleteHandler = async () => {
    try {
      const result = await deleteDepartment(selected);
      refetch();
      message.success("Xóa thành công");
      setSelected(null);
      setTimeout(() => {
        setOpenDialog(false);
      }, 500);
    } catch (error) {
      console.log(err);
      message.error(err?.data?.message || err.error);
    }
  };

  const showDrawer = (departmentId) => {
    const filteredUsers = usersData?.filter(
      (user) => user.department?._id === departmentId
    );
    setSelected(filteredUsers);

    setOpenDrawer(true);
  };

  const onClose = () => {
    setOpenDrawer(false);
  };

  const deleteClick = (id) => {
    setSelected(id);
    setOpenDialog(true);
  };

  const editClick = (el) => {
    setSelectedToUpdate(el);
    setOpen(true);
  };
  console.log(data);
  const columns = [
    {
      title: "Tên bộ môn",
      dataIndex: "name",
      align: "center",
      key: "name",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Trưởng bộ môn",
      dataIndex: ["manager", "name"],
      align: "center",
      key: "manager",
    },
    {
      title: "Các giảng viên",
      dataIndex: "",
      align: "center",
      key: "",
      render: (record) => (
        <div>
          <Button onClick={() => showDrawer(record._id)}>
            Danh sách giảng viên
          </Button>
        </div>
      ),
    },
    {
      title: "Thao tác",
      dataIndex: "action",
      align: "center",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-4 justify-center">
          <Button
            className="text-blue-600 hover:text-blue-500 font-semibold sm:px-0"
            type="button"
            onClick={() => editClick(record)}
          >
            <EditOutlined />
          </Button>

          <Button
            className="text-red-700 hover:text-red-500 font-semibold sm:px-0"
            type="button"
            onClick={() => deleteClick(record._id)}
          >
            <DeleteOutlined />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="w-full md:px-1 px-0 mb-6">
        <div className="flex items-center justify-between mb-8">
          <Title title=" Quản lý bộ môn" />
          <Button
            className="flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md 2xl:py-2.5"
            onClick={() => setOpen(true)}
          >
            Thêm bộ môn {<IoMdAdd className="text-lg" />}
          </Button>
        </div>
      </div>
      <Drawer
        placement="right"
        size="large"
        onClose={onClose}
        open={openDrawer}
        extra={
          <Space>
            <Button onClick={onClose}>Đóng</Button>
          </Space>
        }
      >
        {selected && (
          <Table
            bordered
            dataSource={selected}
            columns={[
              {
                title: "Họ và tên",
                dataIndex: "name",
                align: "center",
                key: "name",
                // ...getColumnSearchProps("name"),
              },
              {
                title: "Chức vụ",
                dataIndex: "role",
                align: "center",
                key: "role",
                // ...getColumnSearchProps("role"),
              },
              {
                title: "Email",
                dataIndex: "email",
                align: "center",
                key: "email",
                // ...getColumnSearchProps("email"),
              },
              {
                title: "Số điện thoại",
                dataIndex: "phone",
                align: "center",
                key: "phone",
                // ...getColumnSearchProps("phone"),
              },
            ]}
            size="large"
          />
        )}
      </Drawer>

      <AddDepartment
        open={open}
        setOpen={setOpen}
        departmentData={selectedToUpdate}
        key={new Date().getTime().toString()}
      />

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />

      <Table bordered dataSource={data} columns={columns} size="large" />
    </>
  );
};

export default Department;
