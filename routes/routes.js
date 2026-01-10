const express = require("express");
const router = express.Router();
const jobSchema = require("../models/jobschema");
const applySchema=require("../models/applyschema")

//show job
router.get("/", async (req, res) => {
  try {
    const jobs = await jobSchema.find().sort({ createdAt: -1 });
    res.render("home", { jobs });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});



// ADD JOB

router.post("/jobs", async (req, res) => {
  try {
    const { Name, Role, Location } = req.body;

    await jobSchema.create({
      Name,
      Role,
      Location,
    });

    req.session.message = {
      type: "success",
      message: "Job added successfully",
    };

    res.redirect("");
  } catch (err) {
    req.session.message = {
      type: "danger",
      message: err.message,
    };
    res.redirect("/job");
  }
});


// UPDATE JOB

router.post("/jobs/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Role, Location } = req.body;

    await jobSchema.findByIdAndUpdate(id, {
      Name,
      Role,
      Location,
    });

    req.session.message = {
      type: "success",
      message: "Job updated successfully",
    };

    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});


// DELETE JOB

router.post("/jobs/delete/:id", async (req, res) => {
  try {
    await jobSchema.findByIdAndDelete(req.params.id);

    req.session.message = {
      type: "success",
      message: "Job deleted successfully",
    };

    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

//listening job
router.get("/applyjob", async (req, res) => {
  try {
    const jobs = await jobSchema.find();   // fetch jobs
    res.render("apply_job", { jobs });     // PASS jobs to EJS
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

//apply button
router.get("/applybutton", async (req, res) => {
  try {
    const applyjobs = await applySchema.find();   // fetch jobs
    res.render("jobform", { applyjobs });     // PASS jobs to EJS
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});


//applyform
router.post("/applyform", async (req, res) => {
  try {
    const { Name, Skills, Location, Phonenumber, jobId } = req.body;

    await applySchema.create({
      Name,
      Skills,
      Phonenumber,
      Location,
      jobId
    });

    req.session.message = {
      type: "success",
      message: "Job added successfully",
    };

    res.redirect("/submitted");
  } catch (err) {
    console.log(err)

    req.session.message = {
      type: "danger",
      message: err.message,
    };
    res.redirect("/apply");
  }
});

//submit job
router.get("/submitted", (req, res) => {
  res.send("Application submitted successfully!");
});



module.exports = router;
