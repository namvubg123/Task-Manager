import React, { useRef, useState } from "react";
import { BiMessageAltDetail } from "react-icons/bi";
import {
  MdAttachFile,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { toast } from "sonner";
import { BGS, PRIOTITYSTYELS, TASK_TYPE, formatDate } from "../../utils";
import clsx from "clsx";
import { FaList } from "react-icons/fa";
import UserInfo from "../UserInfo";
import ConfirmatioDialog from "../Dialogs";
import { useTrashTaskMutation } from "../../redux/slices/api/taskApi";
import AddTask from "./AddTask";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Input, Button, message, Space, Table, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { Highlighter } from "react-highlight-words";

const ICONS = {
  "Ưu tiên": <MdKeyboardDoubleArrowUp />,
  "Quan trọng": <MdKeyboardArrowUp />,
  "Bình thường": <MdKeyboardArrowDown />,
};

const TaskList = ({ tasks }) => {
  console.log(tasks);
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role === "Giảng viên";
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deleteTask] = useTrashTaskMutation();
  const [openEdit, setOpenEdit] = useState(false);
  const navigate = useNavigate();

  const deleteClicks = (id) => {
    setSelected(id);
    setOpenDialog(true);
  };

  const editTaskHandler = (el) => {
    setSelected(el);
    setOpenEdit(true);
  };

  const deleteHandler = async () => {
    try {
      const result = await deleteTask({
        id: selected,
        isTrashed: "trash",
      }).unwrap();
      message.success("Xóa công việc thành công");
      setTimeout(() => {
        setOpenDialog(false);
        window.location.reload();
      }, 500);
    } catch (err) {
      console.log(err);
      message.error(err?.data?.message || err.error);
    }
  };

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
          placeholder={`Tìm kiếm `}
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
            Hoàn tác
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
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : false,
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
  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  const teamMembers = [
    ...new Set(tasks.flatMap((item) => item.team.map((member) => member.name))),
  ];

  const columns = [
    {
      title: "Trạng thái",
      dataIndex: "stage",
      key: "stage",
      align: "center",
      render: (stage, record) => {
        let color = "";
        let label = "";
        switch (stage) {
          case "todo":
            color = "geekblue";
            label = "Cần làm";
            break;
          case "pending":
            color = "gold";
            label = "Chờ duyệt";
            break;
          case "completed":
            color = "green";
            label = "Hoàn thành";
            break;
          case "late":
            color = "red";
            label = "Hoàn thành muộn";
            break;
          case "expired":
            color = "gray";
            label = "Quá hạn";
            break;
        }
        return (
          <Tag color={color} key={stage}>
            {label.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      align: "center",
      ...getColumnSearchProps("title"),
      render: (title, record) => (
        <div onClick={() => navigate(`/task/${record?._id}`)}>{title}</div>
      ),
    },
    {
      title: "Độ ưu tiên",
      dataIndex: "priority",
      key: "priority",
      align: "center",
      ...getColumnSearchProps("priority"),
      render: (text, record) => (
        <div className={"flex gap-1 items-center"}>
          <span className="capitalize line-clamp-1">{record?.priority}</span>
          <span className={clsx("text-lg", PRIOTITYSTYELS[record?.priority])}>
            {ICONS[record?.priority]}
          </span>
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (createdAt, record) => {
        if (createdAt) {
          return (
            <span className="text-sm text-gray-600">
              {formatDate(new Date(createdAt))}
            </span>
          );
        } else {
          return null;
        }
      },
    },
    {
      title: "Hạn chót",
      dataIndex: "deadline",
      key: "deadline",
      align: "center",
      render: (deadline, record) => {
        if (deadline) {
          return (
            <span className="text-sm text-gray-600">
              {formatDate(new Date(deadline))}
            </span>
          );
        } else {
          return null;
        }
      },
    },
    // {
    //   title: "Đính kèm",
    //   dataIndex: "assets",
    //   key: "assets",
    //   align: "center",
    //   render: (text, record) => (
    //     <div className="flex items-center gap-3">
    //       <div className="flex gap-1 items-center text-sm text-gray-600">
    //         <BiMessageAltDetail />
    //         <span>{record?.activities?.length}</span>
    //       </div>
    //       <div className="flex gap-1 items-center text-sm text-gray-600 dark:text-gray-400">
    //         <MdAttachFile />
    //         <span>{record?.assets?.length}</span>
    //       </div>
    //       <div className="flex gap-1 items-center text-sm text-gray-600 dark:text-gray-400">
    //         <FaList />
    //         <span>0/{record?.subTasks?.length}</span>
    //       </div>
    //     </div>
    //   ),
    // },
    {
      title: "Nhân sự",
      dataIndex: "team",
      key: "team",
      align: "center",
      filters: teamMembers.map((name) => ({ text: name, value: name })),
      onFilter: (value, record) =>
        record.team.some((member) => member.name === value),
      filterSearch: true,
      render: (text, record) => (
        <div className="flex">
          {record?.team?.map((m, index) => (
            <div
              key={m._id}
              className={clsx(
                "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                BGS[index % BGS?.length]
              )}
            >
              <UserInfo user={m} />
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (text, record) => (
        <div className="flex gap-2 md:gap-4 justify-end">
          <Button onClick={() => editTaskHandler(record)}>Sửa</Button>

          <Button onClick={() => deleteClicks(record._id)}>Xóa</Button>
        </div>
      ),
    },
  ];
  return (
    <>
      <Table
        dataSource={tasks}
        rowKey="_id"
        columns={columns}
        onChange={onChange}
        bordered
        pagination={{
          pageSize: 10,
        }}
      />

      {/* TODO */}
      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />

      <AddTask
        open={openEdit}
        setOpen={setOpenEdit}
        task={selected}
        key={new Date().getTime()}
      />
    </>
  );
};

export default TaskList;
