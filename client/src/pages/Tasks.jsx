import React, { useState, useEffect } from "react";
import { FaList } from "react-icons/fa";
import { MdGridView } from "react-icons/md";
import { useParams } from "react-router-dom";
import Loading from "../components/Loader";
import Title from "../components/Title";
import Button from "../components/Button";
import { IoMdAdd } from "react-icons/io";
import Tabs from "../components/Tabs";
// import TaskTitle from "../components/TaskTitle";
import BoardView from "../components/BoardView";
// import { tasks } from "../assets/data";
import Table from "../components/task/Table";
import AddTask from "../components/task/AddTask";
import { useGetAllTaskQuery } from "../redux/slices/api/taskApi";
import { useSelector } from "react-redux";

const TABS = [
  { title: " Bảng", icon: <MdGridView /> },
  { title: "Danh sách", icon: <FaList /> },
];

const TASK_TYPE = {
  expired: "bg-black",
  late: "bg-red-600",
  todo: "bg-blue-600",
  pending: "bg-yellow-600",
  completed: "bg-green-600",
};

const Tasks = () => {
  const params = useParams();
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role === "Giảng viên";

  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);

  const status = params?.status || "";

  const { data, isLoading } = useGetAllTaskQuery({
    strQuery: status,
    isTrashed: "",
    search: "",
  });
  console.log(data);

  return isLoading ? (
    <div className="py-10">
      <Loading />
    </div>
  ) : (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Title title={"Công Việc"} />

        {!status && !userRole && (
          <Button
            onClick={() => setOpen(true)}
            label="Thêm công việc"
            icon={<IoMdAdd className="text-lg" />}
            className="flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md py-2 2xl:py-2.5"
          />
        )}
      </div>

      <Tabs tabs={TABS} setSelected={setSelected}>
        {!status && (
          <div className="w-full flex justify-between gap-4 md:gap-x-12 py-4">
            {/* <TaskTitle label="Cần làm" className={TASK_TYPE.todo} />
            <TaskTitle
              label="Đang thực hiện"
              className={TASK_TYPE["in progress"]}
            />
            <TaskTitle label="Hoàn thành" className={TASK_TYPE.completed} /> */}
          </div>
        )}

        {selected !== 1 ? (
          <BoardView tasks={data?.tasks} />
        ) : (
          <div className="w-full">
            <Table tasks={data?.tasks} />
          </div>
        )}
      </Tabs>

      <AddTask open={open} setOpen={setOpen} />
    </div>
  );
};

export default Tasks;
