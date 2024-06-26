import Notice from "../models/notification.js";
import Task from "../models/task.js";
import User from "../models/user.js";
import moment from "moment";

export const createTask = async (req, res) => {
  try {
    const { userId, department } = req.user;

    const {
      title,
      team,
      stage,
      date,
      priority,
      assets,
      deadline,
      description,
    } = req.body;

    if (!team || team.length === 0) {
      return res
        .status(401)
        .json({ status: false, message: "Cần chọn người nhận công việc!" });
    }

    let text = "Công việc mới được giao cho bạn";
    if (team?.length > 1) {
      text = text + ` và ${team?.length - 1} người khác.`;
    }
    const deadlineFormatted = moment(deadline).format("DD/MM/YYYY");
    text =
      text +
      ` Độ ưu tiên là ${priority}. Hạn chót là ngày ${deadlineFormatted}. Thank you!!!`;

    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
    };

    const task = await Task.create({
      title,
      description,
      team,
      stage: stage.toLowerCase(),
      date,
      priority: priority,
      assets,
      activities: activity,
      deadline,
      createdBy: userId,
      department: department,
    });

    await Notice.create({
      team,
      text,
      task: task._id,
    });

    res
      .status(200)
      .json({ status: true, task, message: "Tạo công việc thành công." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const duplicateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    const newTask = await Task.create({
      ...task,
      title: task.title + " - Bản sao",
    });

    newTask.team = task.team;
    newTask.subTasks = task.subTasks;
    newTask.assets = task.assets;
    newTask.priority = task.priority;
    newTask.stage = task.stage;
    newTask.description = task.description;
    newTask.deadline = task.deadline;
    newTask.department = task.department;
    newTask.createdBy = task.createdBy;

    await newTask.save();

    //alert users of the task
    let text = "Công việc vừa được giao cho bạn";
    if (task.team.length > 1) {
      text = text + ` và ${task.team.length - 1} người khác.`;
    }
    const deadlineFormatted = moment(task.deadline).format("DD/MM/YYYY");
    text =
      text +
      ` Mức độ ưu tiên là ${task.priority}. Hạn chót là ngày ${deadlineFormatted}. Thank you!!!`;

    await Notice.create({
      team: task.team,
      text,
      task: newTask._id,
    });

    res
      .status(200)
      .json({ status: true, message: "Task duplicated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const postTaskActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const { type, activity } = req.body;

    const task = await Task.findById(id);

    const data = {
      type,
      activity,
      by: userId,
    };

    task.activities.push(data);

    await task.save();

    res.status(200).json({ status: true, message: "Thành công" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const dashboardStatistics = async (req, res) => {
  try {
    const { userId, isAdmin, role, department } = req.user;

    let query = { isTrashed: false, department };

    let allTasks;
    if (role === "Trưởng bộ môn") {
      allTasks = await Task.find({ ...query, createdBy: userId })
        .populate({
          path: "team",
          select: "name role title email department",
        })
        .sort({ _id: -1 });
    } else {
      allTasks = await Task.find({
        ...query,
        team: { $all: [userId] },
      })
        .populate({
          path: "team",
          select: "name role title email department",
        })
        .sort({ _id: -1 });
    }

    const users = await User.find({ isActive: true })
      .select("name title role isAdmin createdAt department")
      .limit(10)
      .sort({ _id: -1 });

    // Group task by stage and calculate counts
    const groupTasks = allTasks.reduce((result, task) => {
      const stage = task.stage;

      if (!result[stage]) {
        result[stage] = 1;
      } else {
        result[stage] += 1;
      }
      return result;
    }, {});

    // Group tasks by priority
    const groupData = Object.entries(
      allTasks.reduce((result, task) => {
        const { priority } = task;

        result[priority] = (result[priority] || 0) + 1;
        return result;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    // Calculate total tasks
    const totalTasks = allTasks?.length;
    const last5Task = allTasks?.slice(0, 5);

    const summary = {
      allTasks,
      totalTasks,
      last5Task,
      users: isAdmin ? users : [],
      tasks: groupTasks,
      graphData: groupData,
    };

    res.status(200).json({
      status: true,
      message: "Successfully",
      ...summary,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { stage, isTrashed } = req.query;
    const { userId, role, department } = req.user;

    let query = { isTrashed: isTrashed ? true : false };

    if (stage) {
      query.stage = stage;
    }
    query.department = department;

    const tasks =
      role === "Trưởng bộ môn"
        ? await Task.find(query)
            .populate({
              path: "team",
              select: "name role title email department",
            })
            .sort({ _id: -1 })
        : await Task.find({
            ...query,
            team: { $all: [userId] },
          })
            .populate({
              path: "team",
              select: "name role title email department",
            })
            .sort({ _id: -1 });

    res.status(200).json({
      status: true,
      tasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate({
        path: "team",
        select: "name title role email department",
      })
      .populate({
        path: "activities.by",
        select: "name",
      });

    res.status(200).json({
      status: true,
      task,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const createSubTask = async (req, res) => {
  try {
    const { title, tag, date } = req.body;
    console.log(req.params);
    const { id } = req.params;

    const newSubTask = {
      title,
      date,
      tag,
    };

    const task = await Task.findById(id);

    task.subTasks.push(newSubTask);

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "SubTask added successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const { title, deadline, team, stage, priority, assets, description } =
      req.body;

    const task = await Task.findById(id);

    task.title = title;
    task.description = description;
    task.deadline = deadline;
    task.priority = priority;
    task.assets = assets;
    task.stage = stage.toLowerCase();
    task.team = team;

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Cập nhật công việc thành công!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const trashTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    task.isTrashed = true;

    await task.save();

    res.status(200).json({
      status: true,
      message: `Task trashed successfully.`,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const deleteRestoreTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { actionType } = req.query;

    if (actionType === "delete") {
      await Task.findByIdAndDelete(id);
    } else if (actionType === "deleteAll") {
      await Task.deleteMany({ isTrashed: true });
    } else if (actionType === "restore") {
      const resp = await Task.findById(id);

      resp.isTrashed = false;
      resp.save();
    } else if (actionType === "restoreAll") {
      await Task.updateMany(
        { isTrashed: true },
        { $set: { isTrashed: false } }
      );
    }

    res.status(200).json({
      status: true,
      message: `Thành công.`,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};
