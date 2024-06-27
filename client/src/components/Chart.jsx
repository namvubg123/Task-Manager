import React, { useState, useEffect } from "react";
import { Column } from "@ant-design/plots";
import moment from "moment";
import { DatePicker, Select } from "antd";

const { RangePicker } = DatePicker;
const { Option } = Select;

export const Chart = ({ data }) => {
  const [filteredData, setFilteredData] = useState(data);
  const [dateRange, setDateRange] = useState([null, null]);
  const [stage, setStage] = useState("all");

  useEffect(() => {
    let filtered = data;

    if (dateRange && (dateRange[0] || dateRange[1])) {
      // Check if either date in the range is truthy (not null or undefined)
      filtered = filtered.filter((task) => {
        const taskDate = moment(task?.date);
        return taskDate.isBetween(
          dateRange[0] || moment.min(), // Use moment.min() for null start date
          dateRange[1] || moment.max(), // Use moment.max() for null end date
          null,
          "[]"
        );
      });
    }

    if (stage !== "all") {
      filtered = filtered.filter((task) => task?.stage === stage);
    }

    setFilteredData(filtered);
  }, [data, dateRange, stage]);

  const handleDateChange = (date, dateString) => {
    console.log("Ngày đã chọn: ", date, dateString);
    setDateRange(dateString);
  };

  const handleStageChange = (value) => {
    console.log("Stage đã chọn: ", value);
    setStage(value);
  };

  const countTasksByDate = filteredData.reduce((acc, task) => {
    const date = moment(task.date).format("YYYY-MM-DD");
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(countTasksByDate).map((date) => ({
    date,
    count: countTasksByDate[date],
  }));

  const config = {
    data: chartData,
    xField: "date",
    yField: "count",
    scale: {
      x: { padding: 0.5 },
    },
    style: {
      maxWidth: 600,
      margin: "auto",
    },
    meta: {
      date: { alias: "Ngày" },
      count: { alias: "Số lượng công việc" },
    },
  };

  // console.log("Dữ liệu biểu đồ: ", chartData);

  return (
    <div>
      <RangePicker onChange={handleDateChange} style={{ marginBottom: 20 }} />
      <Select
        defaultValue="all"
        onChange={handleStageChange}
        style={{ marginBottom: 20, marginLeft: 10 }}
      >
        <Option value="all">Tất cả các trạng thái</Option>
        <Option value="todo">Cần làm</Option>
        <Option value="pending">Chờ duyệt</Option>
        <Option value="completed">Hoàn thành</Option>
        <Option value="expired">Trễ hạn</Option>
      </Select>
      <Column {...config} />
    </div>
  );
};
