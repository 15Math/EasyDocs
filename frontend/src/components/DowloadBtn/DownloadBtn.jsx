
import "./DownloadBtn.css"
import folderImg from "../../assets/folder.png"
export default function DownloadBtn({handleFileDownload, backgroundColor}){
    
    return (
        <>
            <button 
              className="custom-file"
              onClick={handleFileDownload}
              style={{backgroundColor}}
            >
              <img id="folderImg"src={folderImg} alt=""/>
              Baixar a comprovantes
            </button>
        </>
    )
}