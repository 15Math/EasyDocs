import { useState } from 'react';

import './App.css'


function App() {

  const handleFileChange = ()=>{

  }

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      document.getElementById("file-upload").files = event.dataTransfer.files;
    }
    const dragScreen = document.getElementById("dragScreen");
    dragScreen.style.opacity = 0;
    dragScreen.style.zIndex = -1;
  };

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
        Nomeador de Comprovantes
      </header>
      <section>
        <h1>Nomear comprovantes</h1>
        <p className='description'>Divida seu arquivo PDF de comprovantes em uma pasta zip com arquivos individuais nomeados com suas informações.</p>
        <label htmlFor="file-upload" className="custom-file-upload">
            Selecione ou arraste o arquivo PDF
        </label>
        <input 
          id="file-upload"
          type="file"
          onChange={handleFileChange}
        />
        <p>Modelos nomeados: Itaú Transferência, Itaú DARF, Itaú Boleto, Itaú QR Code</p>
      </section>
      
    </>
  )
}

export default App
