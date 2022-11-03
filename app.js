const cheerio = require("cherio");
const request = require("request-promise");
const fs = require("fs");
const axios = require("axios");
const imagesToPdf = require("images-to-pdf");
const express = require("express");
const cors = require("cors");
const { ExistPdf } = require("./middleware/existPdf");
const path = require("path");

const PORT = process.env.PORT || 3000;
const app = express();
app.use(
  cors({
    origin: "*",
  })
);

app.use("/salsa", express.static("salsa"));

const scrapperCherio = async (atomicNumber) => {
  const MainPage = await request({
    uri: `http://nhentai.to/g/${atomicNumber}`,
    transform: (body) => cheerio.load(body),
  });

  const salsaCount = MainPage("#info>div").html().trim().split(" ")[0];

  for (let i = 1; i <= parseInt(salsaCount); i++) {
    const salsaPage = await request({
      uri: `http://nhentai.to/g/${atomicNumber}/${i}`,
      transform: (body) => cheerio.load(body),
    });

    const salsaUri = salsaPage("#page-container #image-container img").attr(
      "src"
    );
    const path = `${__dirname}/downloads/${i}.jpg`;

    try {
      await download_image(salsaUri, path);
      console.log(`se descargo ${i}`);
    } catch (error) {
      console.log(error);
    }
  }

  console.log("Creating pdf...");
  try {
    await transformPdf(atomicNumber)
  } catch (error) {
    deleteTrash();
    console.log("Pdf error");
    return { res: `no se pudo obtener el pdf`, error: true };
  }
  console.log("Pdf created!!");
  deleteTrash();
  return { res: `salsa/${atomicNumber}.pdf`, error: false };
};

const download_image = (url, image_path) =>
  axios({
    url,
    responseType: "stream",
  }).then(
    (response) =>
      new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(image_path))
          .on("finish", () => resolve())
          .on("error", (e) => reject(e));
      })
);

async function transformPdf(atomicNumber) {
  let images = fs.readdirSync("./downloads");
  images = images.filter((item) => {
    const arrayItem = item.split(".");
    if (arrayItem[1] === "jpg") {
      return item;
    }
  });
  images = images.map(item => item.split(".")[0]).sort((a,b)=> a-b)
  console.log(images);
  const pages = images.map((item) => {
    return (item = `./downloads/${item}.jpg`);
  });
  console.log(pages);
  await imagesToPdf(pages, `salsa/${atomicNumber}.pdf`);
}

function deleteTrash() {
  fs.readdir("./downloads", (err, files) => {
    files.forEach((element) => {
      if (element.split(".")[1] === "jpg") {
        fs.unlinkSync(`./downloads/${element}`);
      }
    });
    console.log("Trash deleted");
  });
}

app.get("/", (req, res) => {
  res.send("Api of manga download");
});

app.get("/download-manga-pdf", ExistPdf ,async (req, res) => {
  const urlToSalsa = await scrapperCherio(req.query.atomicNumber);
  res.send(urlToSalsa);
});

app.listen(PORT, () => {
  console.log("http://localhost:3000");
});
