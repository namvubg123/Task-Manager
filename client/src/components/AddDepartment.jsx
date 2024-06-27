import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, InputNumber, Button, message } from "antd";
import {
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
} from "../redux/slices/api/departmentApi";
import { useGetTeamListQuery } from "../redux/slices/api/userApi";

const AddDepartment = ({ open, setOpen, departmentData }) => {
  const [form] = Form.useForm();
  const [addDepartment, { isLoading }] = useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdating }] =
    useUpdateDepartmentMutation();
  const { data: usersData } = useGetTeamListQuery();
  const [managerList, setManagerList] = useState([]);

  useEffect(() => {
    const filterManager = usersData?.filter(
      (user) => user?.department?._id === departmentData?._id
    );
    console.log(filterManager);
    setManagerList(filterManager);
  }, [usersData]);

  const handleCancel = () => {
    setOpen(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      let result;
      if (departmentData) {
        result = await updateDepartment({
          _id: departmentData._id,
          ...values,
        });
        message.success("Cập nhật thành công");
      } else {
        result = await addDepartment(values);
        if (result.error) {
          throw result.error;
        }
        message.success("Tạo thành công");
      }
      setOpen(false);
      form.resetFields();
    } catch (error) {
      if (error.response && error.response.data) {
        message.error(error.response.data.message);
      } else if (error.data && error.data.message) {
        message.error(error.data.message);
      } else {
        message.error("Lỗi");
      }
    }
  };

  return (
    <Modal
      open={open}
      title={departmentData ? "Cập nhật bộ môn" : "Thêm bộ môn"}
      onCancel={handleCancel}
      footer={null}
    >
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        initialValues={departmentData}
      >
        <Form.Item
          label="Tên bộ môn"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên bộ môn" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Trưởng bộ môn"
          name="manager"
          rules={[{ required: true, message: "Vui lòng chọn trưởng bộ môn" }]}
        >
          <Select placeholder="Chọn trưởng bộ môn">
            {departmentData
              ? managerList?.map((user) => (
                  <Select.Option key={user._id} value={user._id}>
                    {user.name}
                  </Select.Option>
                ))
              : usersData?.map((user) => (
                  <Select.Option key={user._id} value={user._id}>
                    {user.name}
                  </Select.Option>
                ))}
          </Select>
        </Form.Item>
        {departmentData && (
          <Form.Item
            label="Trưởng bộ môn hiện tại"
            name="currentManager"
            initialValue={departmentData?.manager?.name}
            disabled
          >
            <Input disabled />
          </Form.Item>
        )}
        <Form.Item>
          <Button htmlType="submit" loading={isLoading || isUpdating}>
            {departmentData ? "Cập nhật" : "Thêm"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddDepartment;
