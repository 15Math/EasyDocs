

import LandingPage from './screens/LandingPage/LandingPage';
import { ReceiptNamer } from './screens/ReceiptNamer/ReceiptNamer';
import { InvoiceNamer } from './screens/invoiceNamer/invoiceNamer';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import './App.css'


function App() {
  

  return (
    <Router>
      <Routes>
          <Route path="/receiptNamer" element={<ReceiptNamer />} />
          <Route path="/" element={<LandingPage  />} />
          <Route path="/invoiceNamer" element={<InvoiceNamer />} />
        </Routes>
    </Router>
  )
}

export default App
