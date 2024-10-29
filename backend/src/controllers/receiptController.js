import fs from "fs/promises";
import { PDFDocument } from "pdf-lib";
import pdf from "pdf-parse/lib/pdf-parse.js"
import path from "path";

const setPdfName = async (filePath) => {

    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);

    const firstLine = data.text.trim().split('\n')[0];
    const cleanFirstLine = firstLine.split(' ').join('');

    let paymDate;
    let receiverName;
    let paymAmount;

    let matchDate;
    let matchReceiverName;
    

    if(cleanFirstLine === "ComprovantedeTransferência"){
        
        matchDate = data.text.match(/data da transferência:\s*(\d{2}\/\d{2}\/\d{4})/i)[1];

        matchReceiverName = data.text.match(/nome do recebedor:\s*([^\n]+)/i)[1];
        
        const matchPaymAmount = data.text.match(/valor:\s*R\$\s*([\d.]+,\d{2})/i)[1];
        paymAmount = matchPaymAmount;

    }else if(cleanFirstLine === "Comprovantedepagamento-DARF"){
        
        matchDate = data.text.match(/data do pagamento:\s*(\d{2}\/\d{2}\/\d{4})/i)[1];
        
        receiverName = "DARF";

        paymAmount = data.text.match(/valor total:\s*R\$\s*([\d.]+,\d{2})/i)[1];

    }else if(cleanFirstLine === "Comprovantedepagamentodeboleto"){
        
        matchDate = data.text.match(/Data de pagamento:\s*\n?\s*(\d{2}\/\d{2}\/\d{4})/i)[1];
        
        matchReceiverName = data.text.match(/Beneficiário:\s*([A-Za-z0-9\s]+)(?=\s+CPF|CNPJ)/i)[1];
        receiverName = matchReceiverName.split(' ').join('-');
        
        const matchPaymAmount = data.text.match(/(?<!\d)(?<![A-Za-z/])(\d{1,3}(?:\.\d{3})*,\d{2})(?=\s*Data de pagamento:)/)[1];
        paymAmount = matchPaymAmount.substring(2);

    }else if(cleanFirstLine === "ComprovantedepagamentoQRCode"){
        matchDate = data.text.match(/data e hora da expiração:\s*(\d{2}\/\d{2}\/\d{4})\s*às\s*\d{2}:\d{2}:\d{2}/i)[1];  

        matchReceiverName = data.text.match(/nome do recebedor:\s*([^\n]*)/i)[1];
        receiverName = matchReceiverName.split(' ').join('-');
        
        paymAmount = data.text.match(/valor da transação:\s*([\d.]+,\d{2})/i)[1];

    }else{
        const pdfName = "Modelo-não-identificado"
        return pdfName;
    }

    const [day, month, year] = matchDate.split('/');
    paymDate = [year, month, day].join('-'); 

    if(cleanFirstLine != "Comprovantedepagamento-DARF"){
        receiverName = matchReceiverName.split(' ').join('-');
    }

    const pdfName = `${paymDate} ${receiverName} R$${paymAmount} Comprovante`

    return pdfName;
};

const splitPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Por favor, envie um arquivo PDF.' });
        }

        const existingPdfBytes = await fs.readFile(req.file.path);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const totalPages = pdfDoc.getPageCount();
        const splitPdfPaths = [];
        const uploadDir = path.resolve("uploads"); 

        // Loop para dividir o PDF
        for (let i = 0; i < totalPages; i++) {
            const newPdfDoc = await PDFDocument.create();
            const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
            newPdfDoc.addPage(copiedPage);

            const pdfBytes = await newPdfDoc.save();
            const outputPath = path.join(uploadDir, `split_page_${i}.pdf`);
            
            await fs.writeFile(outputPath, pdfBytes); 
            console.log(`Arquivo criado: ${outputPath}`);
            // Renomeia o arquivo para o nome gerado pelo setPdfName
            const newFileName = await setPdfName(outputPath);
            const newPath = path.join(uploadDir, `${newFileName}.pdf`);
            
            await fs.rename(outputPath, newPath);

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
