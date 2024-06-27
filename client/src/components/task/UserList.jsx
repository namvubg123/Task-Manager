import { Listbox, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { BsChevronExpand } from "react-icons/bs";
import { summary } from "../../assets/data";
import clsx from "clsx";
import { getInitials } from "../../utils";
import { MdCheck } from "react-icons/md";
import { useGetTeamListQuery } from "../../redux/slices/api/userApi";
import { Select, Space } from "antd";

const UserList = ({ setTeam, team }) => {
  const { data, isLoading } = useGetTeamListQuery();
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleChange = (selectedValues) => {
    const selectedObjects = selectedValues.map((value) =>
      data.find((user) => user._id === value)
    );
    setSelectedUsers(selectedObjects);
    setTeam(selectedObjects);
  };
  const options = data?.map((user) => ({
    label: user.name,
    value: user._id,
  }));

  return (
    <div>
      <p className="text-gray-700">Người nhận công việc: </p>
      <Select
        mode="multiple"
        allowClear
        style={{
          width: "100%",
        }}
        placeholder="Chọn giảng viên"
        defaultValue={selectedUsers}
        onChange={handleChange}
        options={options}
      />
    </div>
  );
};

export default UserList;
