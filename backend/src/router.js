import express from "express";
import receiptController from "./controllers/receiptController.js"
import multer from "multer"

// const upload = multer({dest:'uploads'});

//Salvando em memória para fazer deploy no vercel
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post('/splitPdf',upload.single('pdfFile'), receiptController.splitPdf);

export default router;