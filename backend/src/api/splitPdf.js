import express from "express";
import multer from "multer";
import receiptController from "../controllers/receiptController.js";

const router = express.Router();
const upload = multer({ dest: 'uploads' });

router.post('/', upload.single('pdfFile'), receiptController.splitPdf);

export default router;  