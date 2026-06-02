import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/navbar.css";

import LogoSkynis from "../assets/logo Skynis.svg?react";
import IconInicio from "../assets/home icon.svg?react";
import IconFilme from "../assets/filmes icon.svg?react";
import IconPerfil from "../assets/perfil icon.svg?react";
import IconAdmin from "../assets/admin icon.svg?react";
import IconSair from "../assets/logout icon.svg?react";
import IconEntrar from "../assets/entrar icon.svg?react";

const paginas = [
  { chave: "inicio",  rotulo: "Inicio",  icone: <IconInicio />, roles: [null, "usuario", "admin"] },
  { chave: "filmes",  rotulo: "Filmes",  icone: <IconFilme />,  roles: [null, "usuario", "admin"] },
  { chave: "perfil",  rotulo: "Perfil",  icone: <IconPerfil />, roles: ["usuario", "admin"] },
  { chave: "admin",   rotulo: "Admin",   icone: <IconAdmin />,  roles: ["admin"] },
];

export default function Navbar({ role = null, paginaAtiva = null, aoNavegar, aoSair }) {
  const [ativa, setAtiva] = useState(paginaAtiva);
  const navigate = useNavigate();

  const navegar = (chave) => {
    setAtiva(chave);
    aoNavegar?.(chave);
    
    if (chave === "inicio") {
      navigate("/"); 
    } else {
      navigate(`/${chave}`); 
    }
  };

  const visiveis = paginas.filter((p) => p.roles.includes(role));

  return (
    <nav className="barra">
      <div className="logo" onClick={() => navegar("inicio")}>
        <LogoSkynis className="logo-svg" />
      </div>

      <ul className="links">
        {visiveis.map((p) => (
          <li key={p.chave}>
            <button
              className={`item${ativa === p.chave ? " ativo" : ""}`}
              onClick={() => navegar(p.chave)}
            >
              {p.icone}
              {p.rotulo}
            </button>
          </li>
        ))}
      </ul>

      <div className="acoes">
        {role === null && (
          <button className="botao botao-entrar" onClick={() => navigate("/login")}>
            <IconEntrar />
            Login
          </button>
        )}

        {role === "admin" && (
          <button className="botao botao-adicionar" onClick={() => navegar("adicionar")}>
            + Adicionar
          </button>
        )}

        {role !== null && (
          <button className="botao botao-sair" onClick={aoSair}>
            <IconSair />
            Sair
          </button>
        )}
      </div>
    </nav>
  );
}