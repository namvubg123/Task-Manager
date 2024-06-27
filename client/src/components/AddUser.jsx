import React, { useState } from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { useRegisterMutation } from "../redux/slices/api/authApi";
import { useUpdateUserMutation } from "../redux/slices/api/userApi";
import { setCredentials } from "../redux/slices/authSlice";
import { useGetDepartmentsQuery } from "../redux/slices/api/departmentApi";
import { useSelector } from "react-redux";
import { toast } from "sonner";

const AddUser = ({ open, setOpen, userData }) => {
  const { user } = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const { Option } = Select;
  const [userId, setUserId] = useState("");

  const [addNewUser, { isLoading }] = useRegisterMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const { data: departmentData } = useGetDepartmentsQuery();

  const handleOnSubmit = async (values) => {
    try {
      if (userData) {
        const result = await updateUser({
          ...values,
          _id: userData?._id,
        }).unwrap();
        message.success(
          "Cập nhật thành công, đăng nhập lại để thấy sự thay đổi"
        );

        if (userData._id === user._id) {
          setCredentials({ ...result.user });
        }
      } else {
        await addNewUser({
          ...values,
          password: values.email,
        }).unwrap();

        message.success("Tạo thành công");
      }
      setTimeout(() => {
        setOpen(false);
      }, 1500);
    } catch (error) {
      message.error(error.data.message);
      console.log(error.data.message);
    }
  };

  return (
    <Modal open={open} onCancel={() => setOpen(false)} footer={null}>
      <Form
        form={form}
        onFinish={handleOnSubmit}
        style={{ margin: "30px 0px" }}
        initialValues={userData}
      >
        <Form.Item name="_id" style={{ display: "none" }}>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item
          label="Họ và tên"
          name="name"
          rules={[{ required: true, message: "Họ và tên là bắt buộc!" }]}
        >
          <Input placeholder="Họ và tên" />
        </Form.Item>
        <Form.Item label="Bộ môn" name="department">
          <Select placeholder="Chọn bộ môn">
            {departmentData &&
              departmentData.map((department) => (
                <Option key={department._id} value={department._id}>
                  {department.name}
                </Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Email là bắt buộc!" }]}
        >
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[{ required: true, message: "Số điện thoại là bắt buộc!" }]}
        >
          <Input placeholder="Số điện thoại" />
        </Form.Item>
        <Form.Item label="Chức vụ" name="role">
          <Select placeholder="Chọn chức vụ">
            <Option value="Trưởng bộ môn">Trưởng bộ môn</Option>
            <Option value="Giảng viên">Giảng viên</Option>
          </Select>
        </Form.Item>

        <Button
          className="bg-blue-500"
          htmlType="submit"
          type="primary"
          loading={isLoading || isUpdating}
        >
          {userData ? "Cập nhật" : "Tạo"}
        </Button>
        <Button style={{ margin: "0px 5px" }} onClick={() => setOpen(false)}>
          Hủy
        </Button>
      </Form>
    </Modal>
  );
};

export default AddUser;
