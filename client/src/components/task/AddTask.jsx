import React, { useState } from "react";
import ModalWrapper from "../ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "../Textbox";
import { useForm } from "react-hook-form";
import UserList from "./UserList";
import SelectList from "../SelectList";
import { BiImages } from "react-icons/bi";
import Button from "../Button";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../../utils/firebase";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from "../../redux/slices/api/taskApi";
import { toast } from "sonner";
import { dateFormatter } from "../../utils";
import { useSelector } from "react-redux";
import { message } from "antd";

const LISTS = ["TODO", "PENDING", "COMPLETED", "LATE", "EXPIRED"];
const PRIORITY = ["Ưu tiên", "Quan trọng", "Bình thường"];

const uploadedFileURLs = [];

const AddTask = ({ open, setOpen, task }) => {
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role === "Giảng viên";

  const defaultValues = {
    title: task?.title || "",
    description: "",
    date: dateFormatter(task?.date || new Date()),
    deadline: dateFormatter(task?.date),
    team: [],
    stage: "TODO",
    priority: "",
    assets: [],
  };
  // const task = "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm(defaultValues);

  const [team, setTeam] = useState(task?.team || []);

  const [stage, setStage] = useState(task?.stage?.toUpperCase() || LISTS[0]);

  const [priority, setPriority] = useState(task?.priority || PRIORITY[2]);

  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  const URLS = task?.assets ? [...task.assets] : [];

  const submitHandler = async (data) => {
    for (const file of assets) {
      setUploading(true);
      try {
        await uploadFile(file);
      } catch (error) {
        console.log("Error while uploading file", error.message);
        return;
      } finally {
        setUploading(false);
      }
    }
    try {
      const newData = {
        ...data,
        assets: [...URLS, ...uploadedFileURLs],
        team: team.length > 0 ? team : [user._id],
        stage,
        priority,
      };

      const res = task?._id
        ? await updateTask({ ...newData, _id: task._id }).unwrap()
        : await createTask(newData).unwrap();

      toast.success("Thành công");
      setTimeout(() => {
        setOpen(false);
      }, 500);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleSelect = (e) => {
    setAssets(e.target.files);
  };

  const uploadFile = async (file) => {
    const storage = getStorage(app);
    const name = new Date().getTime() + file.name;
    const storageRef = ref(storage, name);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          console.log("Uploading");
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              uploadedFileURLs.push(downloadURL);
              resolve();
            })
            .catch((error) => {
              reject(error);
            });
        }
      );
    });
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(submitHandler)}>
          <Dialog.Title
            as="h2"
            className="text-base font-bold leading-6 text-gray-900 mb-4"
          >
            {task ? "CHỈNH SỬA" : "TẠO MỚI"}
          </Dialog.Title>

          <div className="mt-2 flex flex-col gap-6">
            <Textbox
              defaultValue={task?.title}
              placeholder={task?.title || "Tiêu đề"}
              type="text"
              name="title"
              label="Tiêu đề"
              className="w-full rounded"
              register={register("title", { required: "Cần nhập tiêu đề" })}
              error={errors.title ? errors.title.message : ""}
            />
            <Textbox
              defaultValue={task?.description}
              placeholder={task?.description || "Mô tả"}
              type="text"
              name="description"
              label="Mô tả"
              className="w-full rounded"
              register={register("description", { required: "Cần nhập mô tả" })}
              error={errors.description ? errors.description.message : ""}
            />

            {!userRole && <UserList setTeam={setTeam} team={team} />}

            <div className="flex gap-4">
              {/* <SelectList
                label="Trạng thái"
                lists={LISTS}
                selected={stage}
                setSelected={setStage}
              /> */}

              <div className="w-full">
                <Textbox
                  placeholder="Deadline"
                  type="date"
                  name="deadline"
                  label="Deadline"
                  className="w-full rounded"
                  register={register("deadline", {
                    // required: "Deadline is required!",
                  })}
                  error={errors.deadline ? errors.deadline.message : ""}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <SelectList
                label="Độ ưu tiên"
                lists={PRIORITY}
                selected={priority}
                setSelected={setPriority}
              />

              <div className="w-full flex items-center justify-center mt-4">
                <label
                  className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer my-4"
                  htmlFor="imgUpload"
                >
                  <input
                    type="file"
                    className="hidden"
                    id="imgUpload"
                    onChange={(e) => handleSelect(e)}
                    // accept=".jpg, .png, .jpeg"
                    multiple={true}
                  />
                  <BiImages />
                  <span>Đính kèm</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-50 py-6 sm:flex sm:flex-row-reverse gap-4">
              {uploading ? (
                <span className="text-sm py-2 text-red-500">
                  Đang tải đính kèm
                </span>
              ) : (
                <Button
                  label="Hoàn thành"
                  type="submit"
                  className="bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700  sm:w-auto"
                />
              )}

              <Button
                type="button"
                className="bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto"
                onClick={() => setOpen(false)}
                label="Hủy"
              />
            </div>
          </div>
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddTask;
