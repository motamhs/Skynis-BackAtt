import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./css/detalheFilme.css";

export default function FilmeDetalhes() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [filme, setFilme] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarDetalhes = async () => {
      try {
        const resposta = await fetch(`http://localhost:8000/filme?id=${id}`);
        if (resposta.ok) {
          const dados = await resposta.json();
          setFilme(dados);
        } else {
          console.error("Filme não encontrado");
        }
      } catch (erro) {
        console.error("Erro ao buscar filme:", erro);
      } finally {
        setCarregando(false);
      }
    };

    buscarDetalhes();
  }, [id]);

  if (carregando) {
    return <div className="carregando-detalhes">Carregando detalhes...</div>;
  }

  if (!filme) {
    return (
      <div className="filme-nao-encontrado">
        <h2>Filme não encontrado.</h2>
        <button onClick={() => navigate(-1)}>Voltar</button>
      </div>
    );
  }


  const formatarLista = (lista) => {
    if (!lista || lista.length === 0) return "Não informado";
    
   
    if (typeof lista[0] === "string") {
      return lista.join(", ");
    }
    
    
    if (typeof lista[0] === "object" && lista[0].nome) {
      return lista.map(item => item.nome).join(", ");
    }

    return "Não informado";
  };
  

  const orcamentoFormatado = filme.orcamento 
    ? `US$ ${filme.orcamento.toLocaleString('pt-BR')}`
    : "Não informado";

    
  const extrairPais = () => {
  
    if (filme.produtoras && filme.produtoras.length > 0 && filme.produtoras[0].paises) {
      return filme.produtoras[0].paises;
    }
    return "Não informado";
  };

  return (
    <div className="pagina-filme-detalhes">
      <div className="detalhes-container-interno">
        

        <button className="btn-voltar" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Voltar
        </button>

        <div className="conteudo-principal-detalhes">
          

          <div className="area-poster">
            <img src={filme.poster || filme.imagem} alt={filme.titulo} className="poster-grande" />
          </div>


          <div className="area-infos">
            <h1 className="detalhes-titulo">{filme.titulo}</h1>
            
            <div className="detalhes-header-infos">
              <span className="detalhes-ano">{filme.ano}</span>
              <div className="detalhes-tags">
          
                {filme.categorias && filme.categorias.length > 0 ? (
                  filme.categorias.map((cat, index) => (
                    <span key={index} className="tag">{cat}</span>
                  ))
                ) : (
                  <span className="tag">Sem Gênero</span>
                )}
              </div>
            </div>

            <p className="detalhes-sinopse">
              {filme.sinopse || "Sinopse não disponível para este filme."}
            </p>


            <div className="detalhes-botoes-acao">
              <button className="btn-favoritado">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                Favoritado
              </button>
              <button className="btn-solicitar-edicao">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                Solicitar Edição
              </button>
            </div>

   
            <div className="grid-metadados">
              <div className="card-meta">
                <span className="meta-label">DIRETOR</span>
                <span className="meta-valor">{formatarLista(filme.diretores)}</span>
              </div>
              <div className="card-meta">
                <span className="meta-label">DURAÇÃO</span>
                <span className="meta-valor">{filme.duracao || "Não informada"}</span>
              </div>
              <div className="card-meta">
                <span className="meta-label">PRODUTORA</span>
                <span className="meta-valor">{formatarLista(filme.produtoras)}</span>
              </div>
              <div className="card-meta">
                <span className="meta-label">ORÇAMENTO</span>
                <span className="meta-valor">{orcamentoFormatado}</span>
              </div>
              <div className="card-meta">
                <span className="meta-label">PAÍS</span>
                
                <span className="meta-valor">{extrairPais()}</span>
              </div>
              <div className="card-meta">
                <span className="meta-label">IDIOMA</span>
                <span className="meta-valor">{formatarLista(filme.linguagens)}</span>
              </div>
            </div>


            <div className="secao-elenco">
              <h2>Elenco</h2>
              <div className="lista-elenco">
           
                {filme.atores && filme.atores.length > 0 ? (
                  filme.atores.map((ator, index) => (
                    <div key={index} className="ator-card">
                      <div className="ator-avatar">
      
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#666">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <span className="ator-nome">{ator.nome}</span>
                    </div>
                  ))
                ) : (
                  <p className="elenco-vazio">Elenco não informado.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}