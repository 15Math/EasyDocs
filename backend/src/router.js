import express from "express";
import splitPdfController from "./controllers/splitPdfController.js";
import multer from "multer"

const { splitReceiptPdf} = splitPdfController;

//Salvando em memória para fazer deploy no vercel
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post('/splitReceiptPdf',upload.single('pdfFile'), splitReceiptPdf);
router.post('/splitInvoicePdf',upload.single('pdfFile'), splitReceiptPdf);

export default router;