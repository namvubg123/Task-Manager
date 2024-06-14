import React, { useState } from "react";
import Title from "../components/Title";
import { IoMdAdd } from "react-icons/io";
// import { summary } from "../assets/data";
import { getInitials } from "../utils";
import clsx from "clsx";
import ConfirmatioDialog, { UserAction } from "../components/Dialogs";
import AddUser from "../components/AddUser";
import {
  useDeleteUserMutation,
  useGetTeamListQuery,
  useUserActionMutation,
} from "../redux/slices/api/userApi";
import { toast } from "sonner";
import { Table, Button } from "antd";
import { useSelector } from "react-redux";
import { EditOutlined } from "@ant-design/icons";
import { DeleteOutlined } from "@ant-design/icons";

const Users = () => {
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role === "Giảng viên";

  const [openDialog, setOpenDialog] = useState(false);
  const [open, setOpen] = useState(false);
  const [openAction, setOpenAction] = useState(false);
  const [selected, setSelected] = useState(null);

  const { data, isLoading, refetch } = useGetTeamListQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [userAction] = useUserActionMutation();

  const userActionHandler = async () => {
    try {
      const result = await userAction({
        isActive: !selected?.isActive,
        id: selected?._id,
      });

      refetch();
      toast.success(result.data.message);
      setSelected(null);
      setTimeout(() => {
        setOpenAction(false);
      }, 500);
    } catch (error) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };
  const deleteHandler = async () => {
    try {
      const result = await deleteUser(selected);

      refetch();
      toast.success("Xóa thành công");
      setSelected(null);
      setTimeout(() => {
        setOpenDialog(false);
      }, 500);
    } catch (error) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const deleteClick = (id) => {
    setSelected(id);
    setOpenDialog(true);
  };

  const editClick = (el) => {
    setSelected(el);
    setOpen(true);
  };

  const userStatusClick = (el) => {
    setSelected(el);
    setOpenAction(true);
  };

  const columns = [
    {
      title: "Họ và tên",
      dataIndex: "name",
      align: "center",
      key: "name",
    },
    {
      title: "Bộ môn",
      dataIndex: ["department", "name"],
      align: "center",
      key: "title",
    },
    {
      title: "Email",
      dataIndex: "email",
      align: "center",
      key: "email",
    },
    {
      title: "Chức vụ",
      dataIndex: "role",
      align: "center",
      key: "role",
    },

    // {
    //   title: "Tình trạng",
    //   dataIndex: "isActive",
    //   align: "center",
    //   key: "isActive",
    //   render: (isActive, record) => (
    //     <div>
    //       <Button onClick={() => userStatusClick(record)}>
    //         {isActive ? "Hoạt động" : "Ngưng"}
    //       </Button>
    //     </div>
    //   ),
    // },

    {
      title: "Thao tác",
      dataIndex: "action",
      align: "center",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-4 justify-center">
          {!userRole && (
            <Button
              className="text-blue-600 hover:text-blue-500 font-semibold sm:px-0"
              type="button"
              label="Sửa"
              onClick={() => editClick(record)}
            >
              <EditOutlined />
            </Button>
          )}
          {!userRole && (
            <Button
              className="text-red-700 hover:text-red-500 font-semibold sm:px-0"
              type="button"
              label="Xóa"
              onClick={() => deleteClick(record.key)}
            >
              <DeleteOutlined />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="w-full md:px-1 px-0 mb-6">
        <div className="flex items-center justify-between mb-8">
          <Title title=" Quản lý giảng viên" />
          {!userRole && (
            <Button
              label="Thêm giảng viên"
              className="flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md 2xl:py-2.5"
              onClick={() => setOpen(true)}
            >
              Thêm giảng viên
              <IoMdAdd className="text-lg" />
            </Button>
          )}
        </div>
      </div>

      <AddUser
        open={open}
        setOpen={setOpen}
        userData={selected}
        key={new Date().getTime().toString()}
      />

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />

      <UserAction
        open={openAction}
        setOpen={setOpenAction}
        onClick={userActionHandler}
      />
      <Table bordered dataSource={data} columns={columns} />
    </>
  );
};

export default Users;
