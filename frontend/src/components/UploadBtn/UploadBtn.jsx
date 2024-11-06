
import "./UploadBtn.css"
export default function UploadBtn({handleFileChange, backgroundColor}){
    
    return (
        <>
            <label htmlFor="file-upload" className="custom-file" style={{backgroundColor}}>
                Selecione ou arraste o arquivo PDF
            </label>
            <input 
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            name="pdfFile"
            accept=".pdf,application/pdf"
            />
        </>
    )
}