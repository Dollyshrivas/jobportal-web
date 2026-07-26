const express = require("express");
const path = require("path");
const { spawn } = require("child_process");
const router = express.Router();
const jobSchema = require("../models/jobschema");
const applySchema = require("../models/applyschema");
const protectRoute = require("../middleware/protectRoute");

const chatbotScript = path.join(__dirname, "..", "backend-python", "chatbot.py");

//search jobs
router.get("/", async (req, res) => {
  try {
    let query = req.query.q;

    
    if (typeof query !== "string") {
      query = "";
    }

    const jobs = await jobSchema.find({
      $or: [
        { Name: { $regex: query, $options: "i" } },
        { Role: { $regex: query, $options: "i" } }
      ]
    });

    res.render("home", { jobs, q: query });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});






//show job
router.get("/createjob", protectRoute, async (req, res) => {
  try {
    const jobs = await jobSchema
      .find({ createdBy: req.session.user._id })
      .sort({ createdAt: -1 });
    res.render("index", { jobs });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});



// ADD JOB

router.post("/jobs", protectRoute, async (req, res) => {
  try {
    const { Name, Role, Location } = req.body;

    await jobSchema.create({
      Name,
      Role,
      Location,
      createdBy: req.session.user._id,
    });

    req.session.message = {
      type: "success",
      message: "Job added successfully",
    };

    res.redirect("/createjob");
  } catch (err) {
    req.session.message = {
      type: "danger",
      message: err.message,
    };
    res.redirect("/job");
  }
});


// UPDATE JOB

router.post("/jobs/update/:id", protectRoute, async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Role, Location } = req.body;

    const job = await jobSchema.findOne({
      _id: id,
      createdBy: req.session.user._id,
    });

    if (!job) {
      req.session.message = {
        type: "danger",
        message: "You can only update your own jobs",
      };
      return res.redirect("/createjob");
    }

    await jobSchema.findByIdAndUpdate(id, {
      Name,
      Role,
      Location,
    });

    req.session.message = {
      type: "success",
      message: "Job updated successfully",
    };

    res.redirect("/createjob");
  } catch (err) {
    console.log(err);
    res.redirect("/createjob");
  }
});


// DELETE JOB

router.post("/jobs/delete/:id", protectRoute, async (req, res) => {
  try {
    const job = await jobSchema.findOne({
      _id: req.params.id,
      createdBy: req.session.user._id,
    });

    if (!job) {
      req.session.message = {
        type: "danger",
        message: "You can only delete your own jobs",
      };
      return res.redirect("/createjob");
    }

    await jobSchema.findByIdAndDelete(req.params.id);

    req.session.message = {
      type: "success",
      message: "Job deleted successfully",
    };

    res.redirect("/createjob");
  } catch (err) {
    console.log(err);
    res.redirect("/createjob");
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
    // Optional jobId passed as query parameter (from UI). If present, load job details.
    const jobId = req.query.jobId;
    if (jobId) {
      const job = await jobSchema.findById(jobId);
      return res.render("jobform", { job });
    }

    // If no jobId provided, just render the empty apply form (legacy behavior).
    return res.render("jobform");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});


//applyform
router.post("/applyform", async (req, res) => {
  try {
    const { Name, Skills, Location, Phonenumber, jobId } = req.body;
    const userId = req.session.user ? req.session.user._id : undefined;

    await applySchema.create({
      userId,
      jobId,
      Name,
      Skills,
      Phonenumber,
      Location,
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



// chatbot page
router.get("/chatbot", (req, res) => {
  res.render("chatbot");
});

// chatbot API endpoint
router.post("/chatbot", async (req, res) => {
  const message = (req.body.message || "").trim();

  // If the message looks like a job search or contains job-related terms,
  // try to return jobs from the app database first.
  try {
    if (message) {
      // Skip DB job-search for short greetings or trivial messages
      const greetingRegex = /^(hi|hello|hey|hiya|hii|hola|good\s+morning|good\s+afternoon|good\s+evening)\b/i;
      const isGreeting = greetingRegex.test(message) || message.length <= 2;
      if (isGreeting) {
        // let the fallback chatbot script handle greetings
      } else {
      const escaped = message.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      const jobs = await jobSchema.find({
        $or: [
          { Name: { $regex: regex } },
          { Role: { $regex: regex } },
          { Location: { $regex: regex } }
        ]
      }).limit(10);

      if (jobs && jobs.length > 0) {
        const suggestions = jobs.map(j => ({
          label: `${j.Name} — ${j.Role} (${j.Location})`,
          url: `/apply/${j._id}`
        }));
        const reply = `I found ${jobs.length} job(s) matching "${message}".`;
        return res.json({ reply, suggestions });
      }
      }
    }
  } catch (dbErr) {
    console.error('Job search failed:', dbErr);
    // fall through to chatbot script fallback
  }

  // Fallback: run the external chatbot script for general assistant replies
  const pythonCommand = process.env.PYTHON || process.env.PYTHON3 || "python";
  let pythonProcess;
  try {
    pythonProcess = spawn(pythonCommand, [chatbotScript]);
  } catch (spawnError) {
    console.error("Chatbot spawn failed:", spawnError);
    return res.status(500).json({ error: "Chatbot could not start." });
  }

  let output = "";
  let errorOutput = "";

  pythonProcess.stdin.write(JSON.stringify({ message }) + "\n");
  pythonProcess.stdin.end();

  pythonProcess.stdout.on("data", (data) => {
    output += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  pythonProcess.on("error", (err) => {
    console.error("Chatbot process error:", err);
    return res.status(500).json({ error: "Chatbot process failed." });
  });

  pythonProcess.on("close", (code) => {
    if (code !== 0 || errorOutput) {
      console.error("Chatbot error:", code, errorOutput);
      return res.status(500).json({ error: "Chatbot failed to respond." });
    }

    try {
      const parsed = JSON.parse(output.trim());
      if (parsed.reply) {
        return res.json(parsed);
      }
      return res.status(500).json({ error: parsed.error || "Invalid chatbot response." });
    } catch (err) {
      console.error("Chatbot parse error:", err, output);
      return res.status(500).json({ error: "Failed to parse chatbot response." });
    }
  });
});

module.exports = router;

// Route to open apply form for a specific job id
router.get('/apply/:jobId', async (req, res) => {
  try {
    const job = await jobSchema.findById(req.params.jobId);
    if (!job) return res.redirect('/applyjob');
    return res.render('jobform', { job });
  } catch (err) {
    console.error('Failed to load job for apply:', err);
    return res.redirect('/applyjob');
  }
});
