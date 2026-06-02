import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Mail, Pencil, User } from "lucide-react";
import "./css/perfil.css";

export default function Perfil() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({ nome: "", email: "" });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const buscarDadosUsuario = async () => {
      try {
        const resposta = await fetch("http://localhost:8000/usuarios/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (resposta.ok) {
          const dados = await resposta.json();

          setUsuario({
            nome: `${dados.nome} ${dados.sobrenome || ''}`.trim(),
            email: dados.email
          });
        } else {

          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login");
        }
      } catch (erro) {
        console.error("Erro ao buscar perfil:", erro);
      }
    };

    buscarDadosUsuario();
  }, [navigate]);

  const filmesFavoritos = [
    { id: 1, titulo: "Interestelar", ano: "2014", tags: ["Ficção Científica", "Aventura"], imagem: "https://image.tmdb.org/t/p/w500/nCbkHayesgpiIUFH5fgsczIGg4n.jpg" },
    { id: 2, titulo: "Interestelar", ano: "2014", tags: ["Ficção Científica", "Aventura"], imagem: "https://image.tmdb.org/t/p/w500/nCbkHayesgpiIUFH5fgsczIGg4n.jpg" },
  ];

  const solicitacoes = [
    { id: 101, titulo: "Cavaleiro das Trevas", detalhes: "$ 245 Milhoes - $ 250 Milhões", status: "Pendente", imagem: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg" }
  ];

  return (
    <div className="pagina-perfil">
      <div className="perfil-container-interno">


        <section className="card-usuario">
          <div className="avatar-usuario">
            <User size={32} color="#e03c2f" />
          </div>
          <div className="dados-usuario">
            <h2>{usuario.nome}</h2>
            <p className="email-usuario">
              <Mail size={14} />
              {usuario.email}
            </p>
            <button className="btn-editar-perfil">
              <Pencil size={14} />
              Editar perfil
            </button>
          </div>
        </section>


        <section className="secao-perfil">
          <h3>Filmes Favoritos ({filmesFavoritos.length})</h3>
          <div className="grid-favoritos">
            {filmesFavoritos.map((filme) => (
              <div key={`fav-${filme.id}`} className="card-filme-favorito">
                <div className="poster-container">
                  <img src={filme.imagem} alt={filme.titulo} className="poster-filme" />

                  <div className="icone-coracao">
                    <Heart size={16} color="#e03c2f" fill="#e03c2f" />
                  </div>
                </div>
                <div className="card-info">
                  <h4 className="card-titulo">{filme.titulo}</h4>
                  <span className="card-ano">{filme.ano}</span>
                  <div className="card-tags">
                    {filme.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <button
                    className="btn-ver-detalhes-card"
                    onClick={() => navigate(`/filme/${filme.id}`)}
                  >
                    Ver detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>


        <section className="secao-perfil">
          <h3>Solicitações de Edição ({solicitacoes.length})</h3>
          <div className="lista-solicitacoes">
            {solicitacoes.map((solic) => (
              <div key={solic.id} className="card-solicitacao">
                <div className="info-solicitacao-esquerda">
                  <img src={solic.imagem} alt={solic.titulo} className="thumb-solicitacao" />
                  <div className="textos-solicitacao">
                    <h4>{solic.titulo}</h4>
                    <p>{solic.detalhes}</p>
                  </div>
                </div>
                <div className="status-solicitacao">
                  <span className="badge-pendente">{solic.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
