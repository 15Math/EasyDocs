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
    const secondLine = pdfText.trim().split('\n')[1];
    const cleanSecondLine = secondLine.split(' ').join('');


    let paymDate;
    let receiverName;
    let paymAmount;

    let matchDate;

    
    try{

        switch (cleanFirstLine) {
            case "ComprovantedeTransferência":

                matchDate = pdfText.match(/data da transferência:\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1];

                receiverName = pdfText.match(/nome do recebedor:\s*([^\n]+)/i)?.[1];
                
                paymAmount = pdfText.match(/valor:\s*R\$\s*([\d.]+,\d{2})/i)?.[1];

            break;
            case "Comprovantedepagamento-DARF":

                matchDate = pdfText.match(/data do pagamento:\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1];
            
                receiverName = "DARF";
    
                paymAmount = pdfText.match(/valor total:\s*R\$\s*([\d.]+,\d{2})/i)?.[1];    

            break;
            case "Comprovantedepagamentodeboleto":

                matchDate = pdfText.match(/(\d{2}\/\d{2}\/\d{4})\s*Autenticação\s+mecânica/i)?.[1];
            
                receiverName = pdfText.match(/Beneficiário:\s*([\w\s\-.]+)(?=\s+CPF\/CNPJ)/i)?.[1];
    
                if(!pdfText.includes("Beneficiário Final:")){
                    paymAmount = pdfText.match(/(?<!\d)(?<![A-Za-z/])(\d{1,3}(?:\.\d{3})*,\d{2})(?=\s*Data de pagamento:)/i)?.[1];

                }else{
                    paymAmount = data.text.match(/(\d{1,3}(?:\.\d{3})*,\d{2})(?=\s*Beneficiário Final:)/i)?.[1];
                }
    
            break;
            case "ComprovantedepagamentoQRCode":

                matchDate = pdfText.match(/Pagamento efetuado em\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1];

                receiverName = pdfText.match(/nome do recebedor:\s*([^\n]+)/i)?.[1];
            
                paymAmount = pdfText.match(/valor da transação:\s*([\d.]+,\d{2})/i)?.[1];

            break;
            //Comprovante de Transferência de conta corrente para conta corrente
            case "BancoItaú-ComprovantedeTransferência":

                matchDate = pdfText.match(/Transferência efetuada em\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1];
                
                receiverName = pdfText.match(/Nome:\s*([^\n]+)/i)?.[1];
                
                paymAmount = pdfText.match(/Valor:\s*R\$\s*([\d.]+,\d{2})/i)?.[1];
            
            break;
            
            case "BancoItaú-ComprovantedePagamento":
                switch(cleanSecondLine){
                    case "TEDC–outratitularidade":
                        matchDate = pdfText.match(/TED solicitada em\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1];

                        receiverName = pdfText.match(/Nome do favorecido:\s*([^\n]+)/i)?.[1];
                    
                        paymAmount = pdfText.match(/Valor da TED:\s*R\$\s*([\d.]+,\d{2})/i)?.[1];
                    break;
                    case "TributosMunicipais":
                        matchDate = pdfText.match(/Operação efetuada em\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1];
                        console.log(pdfText);
                        paymAmount = pdfText.match(/Valor do documento:\s*R\$\s*([\d.]+,\d{2})/i)?.[1];

                        receiverName = "TRIBUTOS MUNICIPAIS";
                       
                    break;
                    case "TributosEstaduaiscomcódigodebarras":
                        
                        matchDate = pdfText.match(/Operação efetuada em\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1];
                    
                        paymAmount = pdfText.match(/Valor do documento:\s*R\$\s*([\d.]+,\d{2})/i)?.[1];

                        receiverName = "TRIBUTOS ESTADUAIS";
                        

                    break;
                }
            break;
            case "BancoItaú-ComprovantedePagamentodeconcessionárias":

                matchDate = pdfText.match(/Operação efetuada em\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1];
                console.log(matchDate)
                paymAmount = pdfText.match(/Valor do documento:\s*R\$\s*([\d.]+,\d{2})/i)?.[1];

                receiverName = "PAGAMENTO DE CONCESSIONÁRIA";

            break;

            default:
                return createGenericName();
        }   

       
        //Formatando a data
        const [day, month, year] = matchDate.split('/');
        paymDate = [year, month, day].join('.'); 

        const pdfName = `${paymDate} - ${paymAmount} - ${receiverName} - Comprovante`
        return pdfName;
    }catch (erro) {
        console.log("ERRO: erro ao nomear PDF", erro);
        return createGenericName();
    }
};

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
            const newFileName = await setPdfName(pdfBytes); 
            
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

export default {
    splitPdf
};
