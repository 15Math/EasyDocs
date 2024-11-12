import Header from "../../components/Header/Header"
import { Link } from "react-router-dom"

export default function LandingPage(){
    return (
        <>
            <Header></Header>
            <section id="landSec">
                <Link to="/ReceiptNamer" className='landNav receiptNamerLink'>Nomeador de comprovantes</Link>
                <Link to="/InvoiceNamer" className='landNav invoiceNamerLink'>Nomeador de Notas Fiscais</Link>
            </section>
        </>
    )
}
