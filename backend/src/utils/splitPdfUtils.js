import pdf from "pdf-parse/lib/pdf-parse.js"
import fs from 'fs';
import {fromBuffer} from "pdf2pic"
import Tesseract from "tesseract.js";
const getPdfWithText = async (pdfBuffer) => {

    const options = {
        density: 300,
        saveFilename: "pdfImage",
        format: "png",
        height:"1200",
        width:"1200"
    };

    try {
        // Criação do convert a partir do buffer e opções
        const convert = fromBuffer(pdfBuffer, options);
        const imageInfo = await convert(1); 
        const imageBuffer = fs.readFileSync(imageInfo.path);
    
        const { data: { text } } = await Tesseract.recognize(
            imageBuffer, 
            'por',  
            {
                logger: (m) => console.log(m) // Para monitorar o progresso do OCR
            }
        );

        console.log("Extracted Text: ", text);
        return text;
    } catch (error) {
        console.error("Erro durante a conversão do PDF ou OCR:", error); // Logando erro caso aconteça
    }
};


const createGenericName = ()=>{
    const timestamp = Date.now(); 
    const randomPart = Math.floor(Math.random() * 100000); 
    const pdfName = timestamp + randomPart+" Comprovante"
    return pdfName;
}


const setReceiptName = async (pdfBuffer) => {
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
            case "PREFEITURADACIDADEDORIODEJANEIRO":
                
                paymAmount = pdfText.match(/VALOR DA NOTA= \s*R\$\s*([\d.]+,\d{2})/i)?.[1];
                

                receiverName = pdfText.match(/Nome\/Razão Social\s*([^\n\S][^\n]*)/i)?.[1];
               
                
                matchDate = pdfText.match(/Data e Hora de Emissão\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1];

            break;
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

                matchDate = pdfText.match(/Pagamento efetuado em\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1] 
                || pdfText.match(/Pagamentoefetuadoem\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1];

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
                        matchDate = pdfText.match(/Operação efetuada em\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1]
                        || pdfText.match(/Operaçãoefetuada em\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1];
        
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

                matchDate = pdfText.match(/Operação efetuada em\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1]
                            || pdfText.match(/Operaçãoefetuada em\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1];
    
                paymAmount = pdfText.match(/Valor do documento:\s*R\$\s*([\d.]+,\d{2})/i)?.[1];

                receiverName = "PAGAMENTO DE CONCESSIONÁRIA";

            break;
            default:
                return createGenericName();
        }   

       
        //Formatando a data
        const [day, month, year] = matchDate.split('/');
        paymDate = [year, month, day].join('.'); 
        const pdfName = `${paymDate} - ${paymAmount} - ${receiverName.trim()}`
        return pdfName;
    }catch (erro) {
        console.log("ERRO: erro ao nomear PDF", erro);
        return createGenericName();
    }
};



const setInvoiceName = async  ()=>{

}

export default {
    setReceiptName,
    setInvoiceName,
    getPdfWithText
}
