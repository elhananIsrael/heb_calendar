const express = require("express");
const app = express();
const fs = require("fs");
require("dotenv").config();

//Serve static files from the React app
app.use(express.static("client/build"));

app.use(express.json());

try {
  // Get all shiurim.
  app.get("/api/shiureToraHalutza", (req, res) => {
    fs.readFile("./shiure-tora.json", "utf8", (err, data) => {
      if (err) throw err;
      const shiureToraHalutza = JSON.parse(data);
      // console.log("shiureToraHalutza", shiureToraHalutza);
      res.send(shiureToraHalutza);
    });

    // res.send(shiureToraHalutza);
  });

  // The "catchall" handler: For any request that doesn't
  // match one above, send back React's index.html file.
  app.get("*", (req, res) => {
    res.sendFile(__dirname + "/client/build/index.html");
  });

  const port = process.env.PORT || 5000;

  app.listen(port, () => {
    console.log(`app listening on ${port}`);
  });
} catch (error) {
  console.log("ERROR!", error);
}
