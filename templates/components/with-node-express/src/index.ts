import express from "express";

const app = express();
const port = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.json({ message: "Hello from Momo Express server: {{name}}" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
