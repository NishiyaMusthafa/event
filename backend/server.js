
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const Event = mongoose.model("Event", new mongoose.Schema({
  eventName: { type: String, required: true },
  description: String,
  eventDate: String,
  venue: String,
  registrations: { type: Number, default: 0 }
}));

app.get("/api/events", async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

app.post("/api/events", async (req, res) => {
  const event = await Event.create(req.body);
  res.status(201).json(event);
});

app.put("/api/events/:id", async (req, res) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id, req.body, { new: true, runValidators: true }
  );
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json(event);
});

app.delete("/api/events/:id", async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json({ message: "Event deleted" });
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port 5000");
});
