const express = require("express");
const mongoose = require("mongoose");
const AdminJS = require("adminjs");
const AdminJSExpress = require("@adminjs/express");
const AdminJSMongoose = require("@adminjs/mongoose");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model("User", { name: String, email: String, role: String });
const Job = mongoose.model("Job", { title: String, skills: [String], employer: String });

AdminJS.registerAdapter(AdminJSMongoose);
const admin = new AdminJS({ resources: [User, Job], rootPath: "/admin" });
const adminRouter = AdminJSExpress.buildRouter(admin);

app.use(admin.options.rootPath, adminRouter);
app.listen(5004, () => console.log("Admin Panel running on port 5004"));
