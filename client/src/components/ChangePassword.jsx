import { Dialog } from "@headlessui/react";
import React from "react";
import { useForm } from "react-hook-form";
import Button from "./Button";
import ModalWrapper from "./ModalWrapper";
import Textbox from "./Textbox";
import { useChangeUserPasswordMutation } from "../redux/slices/api/userApi";
import { toast } from "sonner";
import Loading from "./Loader";

const ChangePassword = ({ open, setOpen }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [changeUserPassword, { isLoading }] = useChangeUserPasswordMutation();

  const handleOnSubmit = async (data) => {
    if (data.password !== data.cpass) {
      toast.warning("Nhập lại mật khẩu không đúng!");
      return;
    }
    try {
      const res = await changeUserPassword(data).unwrap();
      toast.success("Đổi mật khẩu thành công");

      setTimeout(() => {
        setOpen(false);
      }, 1500);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(handleOnSubmit)} className="">
          <Dialog.Title
            as="h2"
            className="text-base font-bold leading-6 text-gray-900 mb-4"
          >
            Đổi mật khẩu
          </Dialog.Title>
          <div className="mt-2 flex flex-col gap-6">
            <Textbox
              placeholer="Mật khẩu mới"
              type="password"
              name="password"
              label="Mật khẩu mới"
              className="w-full rounded"
              register={register("password", {
                required: "Cần điền mật khẩu mới",
              })}
              error={errors.password ? errors.password.message : ""}
            />
            <Textbox
              placeholer="Nhập lại mật khẩu mới"
              type="password"
              name="cpass"
              label="Nhập lại mật khẩu mới"
              className="w-full rounded"
              register={register("cpass", {
                required: "Cần nhập lại mật khẩu mới",
              })}
              error={errors.cpass ? errors.cpass.message : ""}
            />
          </div>
          {isLoading ? (
            <div className="py-5">
              <Loading />
            </div>
          ) : (
            <div className="py-3 mt-4 sm:flex sm:flex-row-reverse">
              <Button
                type="submit"
                className="bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-400"
                label="Lưu"
              />

              <button
                type="button"
                className="bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto"
                onClick={() => setOpen(false)}
              >
                Hủy
              </button>
            </div>
          )}
        </form>
      </ModalWrapper>
    </>
  );
};

export default ChangePassword;
