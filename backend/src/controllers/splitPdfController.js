import { PDFDocument } from "pdf-lib";
import archiver from "archiver";
import { PassThrough } from "stream";

import splitPdfUtils from "../utils/splitPdfUtils.js";

const {setReceiptName, setInvoiceName, getPdfWithText  } = splitPdfUtils;

const splitPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Por favor, envie um arquivo PDF.' });
        }

        const existingPdfBytes = req.file.buffer;

        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const totalPages = pdfDoc.getPageCount();

        const archive = archiver("zip", { zlib: { level: 9 } });
        const passThrough = new PassThrough();

        archive.pipe(passThrough);

         // Cria uma promessa para o Buffer do arquivo zip
         const zipBufferPromise = new Promise((resolve, reject) => {
            const zipChunks = [];
            passThrough.on("data", (chunk) => zipChunks.push(chunk));
            passThrough.on("end", () => resolve(Buffer.concat(zipChunks)));
            passThrough.on("error", reject);
        });

        // Loop para dividir o PDF
        for (let i = 0; i < totalPages; i++) {
            const newPdfDoc = await PDFDocument.create();
            const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
            newPdfDoc.addPage(copiedPage);
        
            const pdfBytes = await newPdfDoc.save(); 
            const buffer = Buffer.from(pdfBytes);

            let newFileName;
            
            getPdfWithText(pdfBytes);
            newFileName = await setReceiptName(pdfBytes); 
            const endpoint = req.endpoint

            if(endpoint == "/splitReceiptPdf"){
                newFileName += " Comprovante"
            }else{
                newFileName += " - Nota Fiscal"
            }

            archive.append(buffer, { name: `${newFileName}.pdf` });
        }

        await archive.finalize();
        const zipBuffer = await zipBufferPromise;

        const zipBase64 = zipBuffer.toString("base64");

        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename="arquivos.zip"',
        });

        res.json({ zipBase64 });

    } catch (error) {
        console.error('Erro ao ler o PDF:', error);
        res.status(500).json({ error: 'Erro ao processar o arquivo PDF.' });
    }
};

const splitInvoicePdf = ()=>{

}

export default {
    splitPdf,
    splitInvoicePdf
};
