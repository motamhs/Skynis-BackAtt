import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./css/pageadm.css";

export default function Admin() {
  const [filmes, setFilmes] = useState([]);
  const [pendentes, setPendentes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  const [edicoesPendentes, setEdicoesPendentes] = useState([
    {
      id: 1,
      filme_id: 10,
      titulo: "Cavaleiro das Trevas",
      solicitante: "Victor Silva",
      data: "15/04/2026",
      campo: "Custos",
      valor_antigo: "$ 245 Milhoes",
      valor_novo: "$ 250 Milhões",
      poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg"
    }
  ]);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const buscarDadosAdmin = async () => {
      try {
        const [respFilmes, respPendentes] = await Promise.all([
          fetch("http://localhost:8000/listagem"),
          fetch("http://localhost:8000/filmes-pendentes", {
            headers: { "Authorization": `Bearer ${token}` }
          })
        ]);

        if (respFilmes.ok) {
          const dadosFilmes = await respFilmes.json();

          setFilmes(dadosFilmes.filter(f => f.flag === 1 || f.flag === true)); 
        }

        if (respPendentes.ok) {
          const dadosPendentes = await respPendentes.json();
          setPendentes(dadosPendentes);
        } else {
   
          navigate("/");
        }
      } catch (erro) {
        console.error("Erro ao buscar dados do painel:", erro);
      } finally {
        setCarregando(false);
      }
    };

    buscarDadosAdmin();
  }, [token, navigate]);


  const handleAprovarFilme = async (idFilme) => {
    try {
      const resp = await fetch(`http://localhost:8000/aprovafilme?id=${idFilme}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (resp.ok) {
   
        const filmeAprovado = pendentes.find(f => f.id === idFilme);
        setPendentes(pendentes.filter(f => f.id !== idFilme));
        if (filmeAprovado) {
          setFilmes([...filmes, { ...filmeAprovado, flag: 1 }]);
        }
        alert("Filme aprovado com sucesso!");
      } else {
        alert("Erro ao aprovar o filme.");
      }
    } catch (e) {
      console.error(e);
    }
  };


  const handleDeletarFilme = async (idFilme, isPendente = false) => {
    const confirmar = window.confirm("Tem certeza que deseja excluir este filme?");
    if (!confirmar) return;

    try {
      const resp = await fetch(`http://localhost:8000/filme?id=${idFilme}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (resp.ok) {
        if (isPendente) {
          setPendentes(pendentes.filter(f => f.id !== idFilme));
        } else {
          setFilmes(filmes.filter(f => f.id !== idFilme));
        }
      } else {
        alert("Erro ao excluir filme.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (carregando) return <div className="admin-loading">Carregando painel...</div>;

  return (
    <div className="pagina-admin">
      <div className="admin-container">
        <h1 className="admin-titulo-secao">Painel Administrativo</h1>

  
        <div className="admin-resumo-grid">
          <div className="admin-card-resumo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e03c2f" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
              <line x1="7" y1="2" x2="7" y2="22"></line>
              <line x1="17" y1="2" x2="17" y2="22"></line>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <line x1="2" y1="7" x2="7" y2="7"></line>
              <line x1="2" y1="17" x2="7" y2="17"></line>
              <line x1="17" y1="17" x2="22" y2="17"></line>
              <line x1="17" y1="7" x2="22" y2="7"></line>
            </svg>
            <h2>{filmes.length}</h2>
            <p>Total de Filmes</p>
          </div>
          
          <div className="admin-card-resumo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <h2>{pendentes.length}</h2>
            <p>Filmes Pendentes</p>
          </div>

          <div className="admin-card-resumo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <h2>{edicoesPendentes.length}</h2>
            <p>Edições Pendentes</p>
          </div>
        </div>


        <h2 className="admin-titulo-secao">Solicitações de Edição</h2>
        <div className="admin-lista-vertical">
          {edicoesPendentes.length === 0 ? <p className="admin-vazio">Nenhuma edição pendente.</p> : null}

          {edicoesPendentes.map(edicao => (
            <div key={`ed-${edicao.id}`} className="admin-item-lista">
              <div className="admin-item-info">
                <img src={edicao.poster} alt={edicao.titulo} className="admin-item-poster" />
                <div className="admin-textos">
                  <h3>{edicao.titulo}</h3>
                  <p className="admin-subtexto">por {edicao.solicitante} • {edicao.data}</p>
                  <p className="admin-subtexto">campo: <span>{edicao.campo}</span></p>
                  <p className="admin-comparacao">
                    <span className="valor-antigo">{edicao.valor_antigo}</span> - <span className="valor-novo">{edicao.valor_novo}</span>
                  </p>
                </div>
              </div>
              <div className="admin-item-acoes">
                <button className="btn-aprovar" onClick={() => alert("Edição Aprovada! (Mock)")}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
                <button className="btn-rejeitar" onClick={() => setEdicoesPendentes([])}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>
          ))}
        </div>


        <h2 className="admin-titulo-secao">Todos os Filmes</h2>
        <div className="admin-lista-vertical">
          {filmes.length === 0 ? <p className="admin-vazio">Nenhum filme catalogado.</p> : null}

          {filmes.map(filme => (
            <div key={`all-${filme.id}`} className="admin-item-lista">
              <div className="admin-item-info">
                <img src={filme.imagem || filme.poster} alt={filme.titulo} className="admin-item-poster" />
                <div className="admin-textos">
                  <h3>{filme.titulo}</h3>
                  <p>{filme.ano} • ID: {filme.id}</p>
                </div>
              </div>
              <div className="admin-item-acoes">
                <button className="btn-deletar" onClick={() => handleDeletarFilme(filme.id, false)} title="Excluir Filme">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e03c2f" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}