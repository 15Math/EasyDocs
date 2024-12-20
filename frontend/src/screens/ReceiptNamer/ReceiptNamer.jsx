import { useState } from 'react';

import baseURL from '../../utils/baseUrl.js';

import goBackArrow from "../../assets/arrow.png" 

import '../../App.css'

import Header from '../../components/Header/Header.jsx';
import UploadBtn from '../../components/UploadBtn/UploadBtn.jsx';
import DownloadBtn from '../../components/DowloadBtn/DownloadBtn.jsx';


export function ReceiptNamer() {
  
  const [pdfSelected, setPdfSelected] = useState(false);
  const [zip, setZip] = useState('');
  const [loading, setLoading] = useState(false);


  const handleFileDownload = ()=> {
    // Remove o prefixo "data:application/zip;base64," se presente
    console.log('zip:', zip);
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
      setLoading(true);
      try {
        const response = await fetch(baseURL+'/splitReceiptPdf', {
        const response = await fetch(baseURL+'/splitReceiptPdf', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Erro ao enviar o arquivo');
        }
  
        const data = await response.json();
        console.log('Dados recebidos:', data); 
        setZip(data.zipBase64);

        console.log('Arquivo enviado com sucesso:', data);
      } catch (error) {
        console.error('Erro ao enviar o arquivo:', error);
      } finally {
        setLoading(false); // Desativa o loading após a requisição
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
      <Header pdfSelected={pdfSelected} setPdfSelected={setPdfSelected} setZip={setZip} />
      {!pdfSelected ? (
      <section>
        <h1>Nomear comprovantes</h1>
        <p className='description'>Divida seu arquivo PDF de comprovantes em uma pasta zip com arquivos individuais nomeados com suas informações.</p>
        <UploadBtn handleFileChange={handleFileChange} backgroundColor='#e52d2d'></UploadBtn>
        <p className='modelTypes'>Modelos aceitos: Itaú Transferência, Itaú DARF; Itaú Boleto; Itaú QR Code; Itaú Transferência conta corrente para conta corrente; Itaú Comprovante de Pagamento; Itaú Tributos Estaduais com código de barras; Itaú Comprovante de Pagamento de concessionárias
        </p>
      </section>

       ) : (

        <section>
        {loading ? (
          <h1 className="loading">Carregando...</h1> 
        ) : (
          <>
            <h1>Os comprovantes foram nomeados!</h1>
            <p>Clique para baixar o zip com os seus PDFs</p>
            <DownloadBtn handleFileDownload={handleFileDownload}  backgroundColor={'#e52d2d'}></DownloadBtn>
            {pdfSelected ? (
                <button id="arrow" onClick={()=>{setPdfSelected(false); setZip('')}}>
                    <img src={goBackArrow} alt="voltar"/>
                    <p>Voltar</p>
                </button>
                ): null}
          </>
        )}
      </section>
      )}
    </>
  )
}

