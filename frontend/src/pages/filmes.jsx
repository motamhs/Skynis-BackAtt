import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import "./css/filmes.css";

export default function Filmes() {
  const [filmes, setFilmes] = useState([]);
  const [categorias, setCategorias] = useState([]); 
  
  const [filmesFiltrados, setFilmesFiltrados] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(""); 
  
  const [aCarregar, setACarregar] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const [respFilmes, respCategorias] = await Promise.all([
          fetch("http://localhost:8000/filmes"),
          fetch("http://localhost:8000/dados/categorias")
        ]);

        if (respFilmes.ok) {
          const dadosFilmes = await respFilmes.json();
         
          const aprovados = dadosFilmes.filter(f => f.flag === 1 || f.flag === true);
          setFilmes(aprovados);
          setFilmesFiltrados(aprovados);
        }

        if (respCategorias.ok) {
          setCategorias(await respCategorias.json());
        }
      } catch (erro) {
        console.error("Erro ao buscar dados:", erro);
      } finally {
        setACarregar(false);
      }
    };

    buscarDados();
  }, []);

  useEffect(() => {
    let resultado = filmes;

    if (pesquisa) {
      const termo = pesquisa.toLowerCase();
      resultado = resultado.filter((filme) => 
        filme.titulo.toLowerCase().includes(termo)
      );
    }

    if (categoriaSelecionada) {
      const categoriaObj = categorias.find(c => 
        String(c.id) === String(categoriaSelecionada) || 
        String(c.id_categoria) === String(categoriaSelecionada)
      );
      const nomeSelecionado = categoriaObj ? categoriaObj.nome.toLowerCase() : "";

      resultado = resultado.filter((filme) => {
        if (!filme.categorias) return false;
        
        let cats = [];
        if (typeof filme.categorias === 'string') {
            try {
                cats = JSON.parse(filme.categorias);
            } catch(e) {
                cats = filme.categorias.split(',').map(nome => ({ nome: nome.trim() }));
            }
        } else if (Array.isArray(filme.categorias)) {
            cats = filme.categorias;
        }

        if (!Array.isArray(cats)) return false;

        return cats.some(c => {
            const matchId = (c.id && String(c.id) === String(categoriaSelecionada)) || 
                            (c.id_categoria && String(c.id_categoria) === String(categoriaSelecionada));
            
            const matchNome = c.nome && c.nome.toLowerCase() === nomeSelecionado;
            
            return matchId || matchNome;
        });
      });
    }

    setFilmesFiltrados(resultado);
  }, [pesquisa, categoriaSelecionada, filmes, categorias]);

  const limparFiltros = () => {
    setPesquisa("");
    setCategoriaSelecionada("");
  };

  const handleVerDetalhes = (idFilme) => {
    const token = localStorage.getItem("access_token");
    if (!token) navigate("/login");
    else navigate(`/filme/${idFilme}`);
  };

  const renderizarCategorias = (categoriasData) => {
    if (!categoriasData || categoriasData.length === 0) {
        return <span className="tag">Sem Gênero</span>;
    }

    let cats = [];

    if (typeof categoriasData === 'string') {
        try {
            cats = JSON.parse(categoriasData);
        } catch (e) {
            cats = categoriasData.split(',').map((nome, index) => ({ 
                id: `cat-${index}-${Math.random()}`, 
                nome: nome.trim() 
            }));
        }
    } else if (Array.isArray(categoriasData)) {
        cats = categoriasData;
    }

    const categoriasValidas = cats.filter(c => c && c.nome && String(c.nome) !== "null");
    
    if (categoriasValidas.length === 0) return <span className="tag">Sem Gênero</span>;

    return categoriasValidas.slice(0, 2).map((c) => (
        <span key={c.id || c.id_categoria} className="tag">{c.nome}</span>
    ));
  };

  if (aCarregar) return <div className="a-carregar">Carregando filmes...</div>;

  return (
    <div className="pagina-filmes">
      <div className="filmes-container-interno">
        <h1 className="titulo-pagina">Filmes</h1>

        <div className="barra-filtros">
          <div className="campo-pesquisa">
            <Search size={18} color="#888" />
            <input 
              type="text" 
              placeholder="Buscar por título..." 
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
            />
          </div>

          <div className="filtros-dropdown">
            <select 
              className="select-filtro"
              value={categoriaSelecionada}
              onChange={(e) => setCategoriaSelecionada(e.target.value)}
            >
              <option value="">Todos os Gêneros</option>
              {categorias.map((cat) => {
                const catId = cat.id || cat.id_categoria;
                return (
                  <option key={catId} value={catId}>{cat.nome}</option>
                );
              })}
            </select>

            <button className="btn-limpar-filtros" onClick={limparFiltros}>
              <X size={16} color="#e03c2f" />
            </button>
          </div>
        </div>

        <div className="grid-todos-filmes">
          {filmesFiltrados.length > 0 ? (
            filmesFiltrados.map((filme) => (
              <div key={`filme-${filme.id || filme.id_filme}`} className="card-filme">
                {/* Atualizado para ler o campo poster do novo backend */}
                <img src={filme.poster || filme.imagem} alt={filme.titulo} className="poster-filme" />
                <div className="card-info">
                  <h3 className="card-titulo">{filme.titulo}</h3>
                  <span className="card-ano">{filme.ano}</span>
                  <div className="card-tags">
                    {renderizarCategorias(filme.categorias)}
                  </div>
                  <button className="btn-ver-detalhes-card" onClick={() => handleVerDetalhes(filme.id || filme.id_filme)}>
                    Ver detalhes
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="sem-resultados">Nenhum filme encontrado com este filtro.</p>
          )}
        </div>
      </div>
    </div>
  );
}
