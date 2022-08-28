const { chromium } = require("playwright");
const fs = require("fs");
const axios = require("axios");
const imgToPDF = require("image-to-pdf");
const express = require("express");
const cors = require('cors')

const PORT = process.env.PORT || 3000
const app = express();
app.use(cors())

//app.use(express.static("public"));
app.use("/salsa", express.static("salsa"));

const scrapper = async (atomicNumber) => {
  const browser = await chromium.launch();
  console.log("Open Browser...");
  const page = await browser.newPage();
  console.log("Open Page...");
  await page.goto(`http://nhentai.to/g/${atomicNumber}`);
  console.log("Open nHentai...");
  await page.locator("#thumbnail-container .thumb-container a").nth(0).click();
  const salsaCount = await page.textContent(
    ".container #pagination-page-top button .num-pages"
  );
  console.log(`Cantidad de hojas a del manga: ${salsaCount}`);
  console.log("Empezando descarga...");
  for (let i = 0; i < salsaCount; i++) {
    const salsa = await page
      .locator(".container #image-container a img")
      .getAttribute("src");
    const path = `${__dirname}/downloads/manga-image-${i + 1}.jpg`;
    try {
      await download_image(salsa, path);
      console.log(`se descargo ${i + 1}`);
    } catch (error) {
      console.log(error);
    }

    await page.goto(`http://nhentai.to/g/${atomicNumber}/${i + 1}`, {
      waitUntil: "domcontentloaded",
      timeout: 0,
    });
  }

  await browser.close();

  console.log("Creating pdf...");
  await imgsToPdf();
  console.log("Pdf created!!");
  deleteTrash();
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("salsa/salsa.pdf");
    }, 3000)
  });
};

async function imgsToPdf() {
  return new Promise((resolve, reject) => {
    const images = fs.readdirSync("./downloads");
    const pages = images.map((item) => {
      return (item = "./downloads/" + item);
    });

    imgToPDF(pages, imgToPDF.sizes.A4).pipe(
      fs.createWriteStream("./salsa/salsa.pdf")
    );
    resolve("pdf creado");
  });
}

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

function deleteTrash() {
  fs.readdir("./downloads", (err, files) => {
    files.forEach((element) => {
      fs.unlinkSync(`./downloads/${element}`);
    });
    console.log("Trash deleted");
  });
}

app.get("/", (req, res) => {
  res.write('Api of manga download')
  res.end()
});

app.get("/download-manga-pdf", async (req, res) => {
  if (!isNaN(req.query.atomicNumber) && req.query.atomicNumber.length === 6) {
    const urlToSalsa = await scrapper(req.query.atomicNumber);
    res.json({ res: urlToSalsa });
  } else {
    res.json({ res: "valor no valido" });
  }
});

app.listen(PORT, () => {
  console.log("http://localhost:3000");
});
