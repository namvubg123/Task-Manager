import React from "react";
import { Menu } from "antd";
import {
  MdDashboard,
  MdOutlineAddTask,
  MdOutlinePendingActions,
  MdSettings,
  MdTaskAlt,
} from "react-icons/md";
import { FaTasks, FaTrashAlt, FaUsers } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { setOpenSidebar } from "../redux/slices/authSlice";
import clsx from "clsx";
import { TeamOutlined } from "@ant-design/icons";

const { SubMenu } = Menu;

const linkData = [
  {
    label: "Dashboard",
    link: "dashboard",
    icon: <MdDashboard />,
  },
  {
    label: "Công việc",
    link: "tasks",
    icon: <FaTasks />,
  },
  {
    label: "Công việc được giao",
    link: "todo/todo",
    icon: <MdOutlinePendingActions />,
  },
  {
    label: "Hoàn thành",
    link: "completed/completed",
    icon: <MdTaskAlt />,
  },
  {
    label: "Chờ duyệt",
    link: "in-progress/pending",
    icon: <MdOutlinePendingActions />,
  },
  {
    label: "Quá hạn",
    link: "expired/expired",
    icon: <MdOutlinePendingActions />,
  },
  {
    label: "Nhân sự",
    link: "team",
    icon: <FaUsers />,
  },
  {
    label: "Bộ môn",
    link: "department",
    icon: <TeamOutlined />,
  },
  {
    label: "Thùng rác",
    link: "trashed",
    icon: <FaTrashAlt />,
  },
];

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const path = location.pathname.split("/")[1];

  const sidebarLinks = user?.isAdmin ? linkData : linkData.slice(0, 7);

  const closeSidebar = () => {
    dispatch(setOpenSidebar(false));
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 p-5">
      <h1 className="flex gap-1 items-center">
        <p className="bg-blue-600 p-2 rounded-full">
          <MdOutlineAddTask className="text-white text-2xl font-black" />
        </p>
        <span className="text-2xl font-bold text-black">Quản lý công việc</span>
      </h1>

      <div className="flex-1 flex flex-col gap-y-5 py-8">
        <Menu
          mode="vertical"
          selectedKeys={[path]}
          onClick={closeSidebar}
          className="text-gray-800"
        >
          {sidebarLinks.map((link) => (
            <Menu.Item key={link.link} icon={link.icon}>
              <Link to={link.link}>{link.label}</Link>
            </Menu.Item>
          ))}
        </Menu>
      </div>

      <div className="">
        <button className="w-full flex gap-2 p-2 items-center text-lg text-gray-800">
          <MdSettings />
          <span></span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
