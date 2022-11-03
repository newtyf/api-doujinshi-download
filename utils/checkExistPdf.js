const fs = require("fs");
function checkExistPdf(atomicNumber) {
  let pdfs = fs.readdirSync("./salsa");
  pdfs = pdfs.filter((item) => {
    const arrayItem = item.split(".");
    if (arrayItem[1] === "pdf") {
      return item;
    }
  });
  let exist = pdfs.filter((item) => item.split(".")[0] === atomicNumber);
  if (exist.length > 0) {
    return true
  }
  return false
}

module.exports = { checkExistPdf };
