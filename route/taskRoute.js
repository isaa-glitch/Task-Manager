const express = require("express");
const router = express.Router();
const taskController = require("../Controller/taskController");
const auth = require("../middleware/auth");

router.post("/add", auth, taskController.addTask);
router.get("/all", auth, taskController.getAllTasks);
router.get("/hidden", auth, taskController.getSoftDeletedTask);
router.patch("/restore/:id", auth, taskController.restoreTask);
router.put("/update/:id", auth, taskController.updateTask);
router.patch("/softdelete/:id", auth, taskController.softDeleteTask);
router.delete("/hard-delete/:id", auth, taskController.hardDeleteTask);
router.get("/audio", taskController.audiourl)
router.post("/taskpdf", taskController.taskpdf);

module.exports = router;
