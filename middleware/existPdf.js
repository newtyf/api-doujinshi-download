const { checkExistPdf } = require("../utils/checkExistPdf");

function ExistPdf(req, res, next) {
  const atomicNumber = req.query.atomicNumber
  if (checkExistPdf(req.query.atomicNumber)) {
    return res.send({ res: `salsa/${atomicNumber}.pdf`, error: false });
  }
  if (!isNaN(atomicNumber) && atomicNumber.length === 6) {
    next();
  } else {
    res.send({ res: "valor no valido", error: true });
  }
}

module.exports = { ExistPdf };
