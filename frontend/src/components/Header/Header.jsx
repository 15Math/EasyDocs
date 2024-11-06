
import { Link } from 'react-router-dom';
import "./Header.css"
export default function Header(){
    
    return (

        <header>
                
                <Link to="/" className='header-link nav receipt'>Comprovantes</Link>
                <Link to="/landingPage" className='header-link header-title'>EasyDocs</Link>
                <Link to="/invoiceNamer" className='header-link nav invoice'>Nota Fiscal</Link>

        </header>

    )
}