const Task = require("../Model/taskModel");
const Auth = require("../Model/authModel");
const { sendTaskEmail } = require("../utils/emailHelper");
const { uploadImage } = require("../utils/cloudinary");
const googleTTS = require("google-tts-api");

exports.addTask = async (req, res) => {
  try {
    let url = "";
    if (req.files && req.files.image) {
      const result = await uploadImage(req.files.image);
      url = result.url || result[0]?.url;
      console.log(`url`, url);
    }
    const newTask = new Task({
      ...req.body,
      assignedBy: req.user.id,
      images: url,
    });
    await newTask.save();

    res.status(201).json(newTask);

    if (req.body.assignedTo && req.body.assignedTo !== req.user.id) {
      const assignee = await Auth.findById(req.body.assignedTo);
      if (assignee && assignee.email) {
        sendTaskEmail(assignee.email, newTask.title, newTask.description);
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllTasks = async (req, res) => {
  console.log("\n--- GET ALL TASKS TRIGGERED ---");
  console.log("1. Role is:", req.user.role);

  try {
    if (req.user.role === "admin") {
      console.log("2. Running Admin Database Query...");

      const tasks = await Task.find({ isDeleted: { $ne: true } })
        .populate("assignedBy", "email")
        .populate("assignedTo", "email");

      console.log(`3. Database returned ${tasks.length} tasks!`);

      return res.status(200).json(tasks);
    } else {
      console.log("2. Running Standard User Query...");
      const tasks = await Task.find({
        $or: [{ assignedBy: req.user.id }, { assignedTo: req.user.id }],
        isDeleted: { $ne: true },
      })
        .populate("assignedBy", "email")
        .populate("assignedTo", "email");
      return res.status(200).json(tasks);
    }
  } catch (error) {
    console.log("❌ ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getSoftDeletedTask = async (req, res) => {
  try {
    const task = await Task.find({ isDeleted: true });
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const filter =
      req.user.role === "admin"
        ? { _id: req.params.id }
        : { _id: req.params.id };

    if (req.files && req.files.image) {
      const result = await uploadImage(req.files.image);
      req.body.images = result.url || result[0]?.url;
    }

    const task = await Task.findOneAndUpdate(filter, req.body, { new: true });

    if (!task)
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized" });
    res.status(200).json(task);

    if (req.body.status === "completed") {
      const assigner = await Auth.findById(task.assignedBy);
      if (assigner && assigner.email) {
        sendTaskEmail(
          assigner.email,
          "Task Completed!",
          `Good news! The task "${task.title}" has just been marked as completed.`,
        );
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.softDeleteTask = async (req, res) => {
  console.log(`started>>>>>`);
  try {
    const filter =
      req.user.role === "admin"
        ? { _id: req.params.id }
        : { _id: req.params.id };
    const task = await Task.findOneAndUpdate(
      filter,
      { isDeleted: true },
      { new: true },
    );

    if (!task)
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized" });
    res.status(200).json({ message: "Task moved to trash" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.hardDeleteTask = async (req, res) => {
  try {
    const filter =
      req.user.role === "admin"
        ? { _id: req.params.id }
        : { _id: req.params.id };
    const task = await Task.findOneAndDelete(filter);

    if (!task)
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized" });
    res.status(200).json({ message: "Task permanently deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.restoreTask = async (req, res) => {
  console.log(`started>>>>>`);
  try {
    const filter =
      req.user.role === "admin"
        ? { _id: req.params.id }
        : { _id: req.params.id };
    const task = await Task.findOneAndUpdate(
      filter,
      { isDeleted: false },
      { new: true },
    );

    if (!task)
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized" });
    res.status(200).json({ task, message: "Task moved to trash" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.audiourl = async (req, res) => {
  try {
    const { text } = req.query;

    if (!text) {
      return res
        .status(400)
        .json({ error: "Text query parameter is required" });
    }

    const audioUrls = googleTTS.getAllAudioUrls(text, {
      lang: "en",
      slow: false,
      host: "https://translate.google.com",
      splitPunct: ",.?",
    });

    return res.status(200).json(audioUrls);
    console.log(`audiourlll>>>`, audioUrls);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to generate audio URLs" });
  }
};

const { pdf } = require("../utils/pdf");

exports.taskpdf = async (req, res) => {
  try {
    const { task } = req.body;

    if (!task) {
      return res.status(400).json({ message: "No task data provided" });
    }

    // Generate the PDF
    const pdfBuffer = pdf(task);

    // Send it back to the browser
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="task-details.pdf"',
    );

    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.log("PDF Error: ", err);
    res.status(500).json({ message: "internal server error" });
  }
};