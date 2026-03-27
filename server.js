const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to my friends website!");
});

app.listen(3000, () => console.log("Server running"));
