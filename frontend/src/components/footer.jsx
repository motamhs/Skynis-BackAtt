import { Link } from "react-router-dom";
import LogoSkynis from "../assets/logo Skynis.svg?react";
import "./css/footer.css"; 

export default function Footer() {
  const anoAtual = new Date().getFullYear();

  return (
    <footer className="footer-container">

      <div className="footer-logo">
        <LogoSkynis className="logo-svg-footer" />
      </div>


      <div className="footer-texto">
        <p>© {anoAtual} Skynis. Todos os direitos reservados.</p>
      </div>


      <div className="footer-links">
        <Link to="/termos">Termos</Link>
        <Link to="/privacidade">Privacidade</Link>
        <Link to="/contato">Contato</Link>
      </div>
    </footer>
  );
}