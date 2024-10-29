import fs from "fs";
import { PDFDocument } from "pdf-lib";
import pdf from "pdf-parse/lib/pdf-parse.js"
import path from "path";

const setPdfName = async (filePath) => {
    if (!fs.existsSync(filePath)) {
        console.log(`Arquivo não encontrado: ${filePath}`);
        return;
    }
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    const firstLine = data.text.trim().split('\n')[0];
    const cleanFirstLine = firstLine.split(' ').join('');

    let paymDate;
    let reciverName;
    let paymAmount;

    if(cleanFirstLine === "ComprovantedeTransferência"){
        
        const matchDate = data.text.match(/data da transferência:\s*(\d{2}\/\d{2}\/\d{4})/i)[1];
        const [day, month, year] = matchDate.split('/');
        paymDate = [year, month, day].join('-'); 

        const matchName = data.text.match(/nome do recebedor:\s*([^\n]+)/i)[1];
        reciverName = matchName.split(' ').join('-');
        
        paymAmount = data.text.match(/valor:\s*R\$\s*([\d.]+,\d{2})/i)[1];

    }else if(cleanFirstLine === "Comprovantedepagamento-DARF"){
        
        const matchDate = data.text.match(/data do pagamento:\s*(\d{2}\/\d{2}\/\d{4})/i)[1];
        const [day, month, year] = matchDate.split('/');
        paymDate = [year, month, day].join('-'); 
        
        reciverName = "DARF";

        paymAmount = data.text.match(/valor total:\s*R\$\s*([\d.]+,\d{2})/i)[1];

    }else if(cleanFirstLine === "Comprovantedepagamentodeboleto"){
        
        const matchDate = data.text.match(/Data de pagamento:\s*\n?\s*(\d{2}\/\d{2}\/\d{4})/i)[1];
        const [day, month, year] = matchDate.split('/');
        paymDate = [year, month, day].join('-'); 
        
        const matchName = data.text.match(/Beneficiário:\s*([^C]*)/i)[1];
        reciverName = matchName.split(' ').join('-');
        
        paymAmount = data.text.match(/(?<!\d)(?<![A-Za-z/])(\d{1,3}(?:\.\d{3})*,\d{2})(?=\s*Data de pagamento:)/)[1];
        paymAmount = paymAmount.substring(2);
        console.log("TEXTO", `${paymDate}|${reciverName}|${paymAmount}|Comprovante`);

    }else if(cleanFirstLine === "ComprovantedepagamentoQRCode"){

    }else if(cleanFirstLine === "Banco Itaú - Comprovante de Pagamento de concessionárias"){
        
    }else{
        throw new Error('Comprovante não identificado');
    }




    const pdfName = `${paymDate}|${reciverName}|${paymAmount}|Comprovante`

    return data.text.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

const splitPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Por favor, envie um arquivo PDF.' });
        }

        const existingPdfBytes = fs.readFileSync(req.file.path);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const totalPages = pdfDoc.getPageCount();
        const splitPdfPaths = [];
        const uploadDir = path.resolve("../uploads"); 

        // Loop para dividir o PDF
        for (let i = 0; i < totalPages; i++) {
            const newPdfDoc = await PDFDocument.create();
            const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
            newPdfDoc.addPage(copiedPage);

            const pdfBytes = await newPdfDoc.save();
            const outputPath = path.join(uploadDir, `split_page.pdf`);
            
            fs.writeFileSync(outputPath, pdfBytes);
            console.log(`Escrevendo PDF em: ${outputPath}`);

            // Renomeia o arquivo para o nome gerado pelo setPdfName
            const newFileName = await setPdfName(outputPath);
            const newPath = path.join(uploadDir, `${newFileName}.pdf`);
            fs.renameSync(outputPath, newPath);

            splitPdfPaths.push(newPath);
        }
        res.json({ splitPdfs: splitPdfPaths });
    } catch (error) {
        console.error('Erro ao ler o PDF:', error);
        res.status(500).json({ error: 'Erro ao processar o arquivo PDF.' });
    }
};

export default {
    splitPdf
};
