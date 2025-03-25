const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const { OpenAI } = require("openai");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const ResumeSchema = new mongoose.Schema({ name: String, skills: [String], experience: String });
const JobSchema = new mongoose.Schema({ title: String, requiredSkills: [String], description: String });

const Resume = mongoose.model("Resume", ResumeSchema);
const Job = mongoose.model("Job", JobSchema);

// File Upload (PDF/DOCX)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Extract text from resume using OpenAI
async function analyzeResume(resumeText) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "system", content: "Extract skills and work experience from resumes." },
               { role: "user", content: resumeText }],
  });

  return JSON.parse(response.choices[0].message.content);
}

// Upload & Analyze Resume
app.post("/upload-resume", upload.single("resume"), async (req, res) => {
  const resumeText = req.file.buffer.toString("utf-8"); // Convert file to text
  const analysis = await analyzeResume(resumeText);

  const newResume = new Resume({
    name: req.body.name,
    skills: analysis.skills,
    experience: analysis.experience,
  });

  await newResume.save();
  res.json({ message: "Resume analyzed and saved!", data: newResume });
});

// Job Posting
app.post("/post-job", async (req, res) => {
  const newJob = new Job({
    title: req.body.title,
    requiredSkills: req.body.requiredSkills,
    description: req.body.description,
  });

  await newJob.save();
  res.json({ message: "Job posted successfully!", data: newJob });
});

// Match Resumes to Jobs
app.get("/match-jobs/:resumeId", async (req, res) => {
  const resume = await Resume.findById(req.params.resumeId);
  if (!resume) return res.status(404).json({ message: "Resume not found" });

  const jobs = await Job.find();
  const matchedJobs = jobs.filter(job => job.requiredSkills.some(skill => resume.skills.includes(skill)));

  res.json({ message: "Matching jobs found!", jobs: matchedJobs });
});

// Start Server
app.listen(5000, () => console.log("Server running on port 5000"));
