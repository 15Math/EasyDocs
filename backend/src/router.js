import express from "express";
import splitPdfController from "./controllers/splitPdfController.js";
import multer from "multer"

const { splitPdf } = splitPdfController;

//Salvando em memória para fazer deploy no vercel
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();
console.log("aaaaaaa")
router.post('/splitReceiptPdf',upload.single('pdfFile'), splitPdf);
router.post('/splitInvoicePdf',upload.single('pdfFile'), splitPdf);

export default router;