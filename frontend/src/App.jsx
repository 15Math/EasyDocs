import { useState } from 'react';
import arrowImg from './assets/arrow.png';
import folderImg from './assets/folder.png'

import './App.css'


function App() {
  
  const [pdfSelected, setPdfSelected] = useState(false);
  const [zip, setZip] = useState('')

  const baseURL = "https://receipt-namer-api.vercel.app";

  const handleFileDownload = ()=> {
    // Remove o prefixo "data:application/zip;base64," se presente
    const base64WithoutPrefix = zip.replace(/^data:application\/zip;base64,/, '');
    const byteCharacters = atob(base64WithoutPrefix);
    
    // Cria um array de bytes
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    
    const blob = new Blob([byteArray], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const timestamp = Date.now(); 
    const randomPart = Math.floor(Math.random() * 100000); 
    link.download = "Comprovantes "+timestamp+randomPart;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);

    setPdfSelected(false);
    setZip('');
}


  const handleFileChange = async(event)=>{
    const pdfFile = event.target.files[0];
    if (pdfFile) {
      setPdfSelected(true); 
      const formData = new FormData(); 
      formData.append('pdfFile', pdfFile);
      try {
        const response = await fetch(baseURL+'/splitPdf', {
          method: 'POST',
          body: formData, // Envia o FormData
        });
        
        if (!response.ok) {
          throw new Error('Erro ao enviar o arquivo');
        }
  
        const data = await response.json();
        setZip(data.zipBase64);

        console.log('Arquivo enviado com sucesso:', data);
      } catch (error) {
        console.error('Erro ao enviar o arquivo:', error);
      }
    }
  }

  const handleDrop = (event) => {
    event.preventDefault(); 
    const file = event.dataTransfer.files[0]; 
    const fileUpload = document.getElementById("file-upload");
    const dragScreen = document.getElementById("dragScreen");

    if (file && file.type === 'application/pdf') {
        const dataTransfer = new DataTransfer(); 
        dataTransfer.items.add(file); 
        fileUpload.files = dataTransfer.files; 

        handleFileChange({ target: fileUpload });

        dragScreen.style.opacity = 0; 
        dragScreen.style.zIndex = -1;  
    } else {
        alert('Por favor, solte um arquivo PDF.');
        dragScreen.style.opacity = 0;
    }
    
  }

  const handleDragOver = (event) => {
    event.preventDefault();
    const dragScreen = document.getElementById("dragScreen");
    dragScreen.style.opacity = 100;
    dragScreen.style.zIndex = 1;
  };

  const handleDragLeave = ()=>{
    const dragScreen = document.getElementById("dragScreen");
    dragScreen.style.opacity = 0;
    dragScreen.style.zIndex = -1;
  }

  return (
    <>
      <div id="dragScreen" onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
        Solte seu PDF aqui
      </div>
      <header>
        {pdfSelected ? (
          <button id="arrow" onClick={()=>{setPdfSelected(false); setZip('')}}>
            <img src={arrowImg} alt="voltar"/>
          </button>
        ): null}
        <p className='header-title'>RECEIPT NAMER</p>
      </header>
      {!pdfSelected ? (
      <section>
        <h1>Nomear comprovantes</h1>
        <p className='description'>Divida seu arquivo PDF de comprovantes em uma pasta zip com arquivos individuais nomeados com suas informações.</p>
        <label htmlFor="file-upload" className="custom-file">
            Selecione ou arraste o arquivo PDF
        </label>
        <input 
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          name="pdfFile"
          accept=".pdf,application/pdf"
        />
        <p>Modelos nomeados: Itaú Transferência, Itaú DARF, Itaú Boleto, Itaú QR Code</p>
      </section>

       ) : (

        <section>
        <h1>Os comprovantes foram nomeados!</h1>
        <p>Clique para baixar o zip com os seus PDFs</p>
        <button 
          className="custom-file"
          onClick={handleFileDownload}
        >
          <img id="folderImg"src={folderImg} alt=""/>
          Baixar a comprovantes
        </button>
      </section>
      )}
      
    </>
  )
}

export default App
