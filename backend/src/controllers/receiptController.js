import { PDFDocument } from "pdf-lib";
import pdf from "pdf-parse/lib/pdf-parse.js"
import archiver from "archiver";
import { PassThrough } from "stream";

// const uploadDir = path.resolve("uploads"); 


const createGenericName = ()=>{
        const timestamp = Date.now(); 
        const randomPart = Math.floor(Math.random() * 100000); 
        const pdfName = timestamp + randomPart+" Comprovante"
        return pdfName;
}

const setPdfName = async (pdfBuffer) => {
    const data = await pdf(pdfBuffer);
    const pdfText = data.text;
    const firstLine = pdfText.trim().split('\n')[0];
    const cleanFirstLine = firstLine.split(' ').join('');

    let paymDate;
    let receiverName;
    let paymAmount;

    let matchDate;
    let matchReceiverName;
    

    if(cleanFirstLine === "ComprovantedeTransferência"){
        
        matchDate = pdfText.match(/data da transferência:\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1];

        matchReceiverName = pdfText.match(/nome do recebedor:\s*([^\n]+)/i)?.[1];
        
        paymAmount = pdfText.match(/valor:\s*R\$\s*([\d.]+,\d{2})/i)?.[1];

    }else if(cleanFirstLine === "Comprovantedepagamento-DARF"){
        
        matchDate = pdfText.match(/data do pagamento:\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1];
        
        receiverName = "DARF";

        paymAmount = pdfText.match(/valor total:\s*R\$\s*([\d.]+,\d{2})/i)?.[1];

    }else if(cleanFirstLine === "Comprovantedepagamentodeboleto"){
        
        matchDate = pdfText.match(/(\d{2}\/\d{2}\/\d{4})\s*Autenticação\s+mecânica/i)?.[1];
        
        matchReceiverName = pdfText.match(/Beneficiário:\s*([\w\s]+)(?=\s+CPF\/CNPJ)/i)?.[1];
        
        let matchPaymAmount;

        if(!pdfText.includes("Beneficiário Final:")){
            matchPaymAmount = pdfText.match(/(?<!\d)(?<![A-Za-z/])(\d{1,3}(?:\.\d{3})*,\d{2})(?=\s*Data de pagamento:)/i)?.[1];

            paymAmount = matchPaymAmount.substring(2);
        }else{
            paymAmount = data.text.match(/(\d{1,3}(?:\.\d{3})*,\d{2})(?=\s*Beneficiário Final:)/i)?.[1];
        }
    }else if(cleanFirstLine === "ComprovantedepagamentoQRCode"){
        matchDate = pdfText.match(/data e hora da expiração:\s*(\d{2}\/\d{2}\/\d{4})\s*às\s*\d{2}:\d{2}:\d{2}/i)?.[1];  

        matchReceiverName = pdfText.match(/nome do recebedor:\s*([^\n]*)/i)?.[1];

        paymAmount = pdfText.match(/valor da transação:\s*([\d.]+,\d{2})/i)?.[1];
    }else{
        return createGenericName()
    }

    //Formatando a data
    const [day, month, year] = matchDate.split('/');
    paymDate = [year, month, day].join('.'); 

    //Formatando os nomes de beneficiários
    if(cleanFirstLine != "Comprovantedepagamento-DARF"){
        receiverName = matchReceiverName.split(' ').join(' ');
    }

    const pdfName = `${paymDate} - ${receiverName} - ${paymAmount} - Comprovante`
    return pdfName;
};

const splitPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Por favor, envie um arquivo PDF.' });
        }

        const existingPdfBytes = req.file.buffer;

        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const totalPages = pdfDoc.getPageCount();
        const splitPdfBuffers = [];

        // Loop para dividir o PDF
        for (let i = 0; i < totalPages; i++) {
            const newPdfDoc = await PDFDocument.create();
            const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
            newPdfDoc.addPage(copiedPage);
        
            const pdfBytes = await newPdfDoc.save(); 

            const buffer = Buffer.from(pdfBytes);
            const newFileName = await setPdfName(pdfBytes); 
            splitPdfBuffers.push({ buffer, fileName: `${newFileName}.pdf` }); 
        }

        const archive = archiver("zip", { zlib: { level: 9 } });
        const passThrough = new PassThrough();

        // Pipa o `archive` para o `PassThrough` e armazena os chunks
        const zipBuffer = await new Promise((resolve, reject) => {
            const zipChunks = [];
            passThrough.on("data", (chunk) => zipChunks.push(chunk));
            passThrough.on("end", () => resolve(Buffer.concat(zipChunks)));
            passThrough.on("error", reject);


            
            for (const file of splitPdfBuffers) {
                archive.append(file.buffer, { name: file.fileName });
            }
            archive.pipe(passThrough);
            archive.finalize();
        });

        const zipBase64 = zipBuffer.toString("base64");
        res.json({ zipBase64 });

    } catch (error) {
        console.error('Erro ao ler o PDF:', error);
        res.status(500).json({ error: 'Erro ao processar o arquivo PDF.' });
    }
};

export default {
    splitPdf
};
