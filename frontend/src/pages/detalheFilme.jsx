import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart, Pencil, Save, Send, User, X } from "lucide-react";
import "./css/detalheFilme.css";

const API_URL = "http://localhost:8000";
const POSTER_PADRAO = "https://placehold.co/500x750/111111/e03c2f?text=Sem+Poster";
const AUXILIARES_VAZIOS = {
  atores: [],
  categorias: [],
  diretores: [],
  linguagens: [],
  paises: [],
  produtoras: [],
};

const usuarioEhAdmin = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return false;

  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = JSON.parse(
      atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"))
    );

    return payloadJson.role === "admin";
  } catch {
    return false;
  }
};

const idDoItem = (item, campo) => item?.id ?? item?.[campo];

const idsDaLista = (lista, campo) =>
  (Array.isArray(lista) ? lista : [])
    .map((item) => idDoItem(item, campo))
    .filter((itemId) => itemId !== undefined && itemId !== null)
    .map(String);

const criarFormulario = (filme) => ({
  titulo: filme?.titulo || "",
  ano: filme?.ano ? String(filme.ano) : "",
  duracao: filme?.duracao || "",
  orcamento: filme?.orcamento ? String(filme.orcamento) : "",
  sinopse: filme?.sinopse || "",
  poster: filme?.poster || "",
  banner: filme?.banner || "",
  trailer: filme?.trailer || "",
  ids_atores: idsDaLista(filme?.atores, "id_ator"),
  ids_categorias: idsDaLista(filme?.categorias, "id_categoria"),
  ids_diretores: idsDaLista(filme?.diretores, "id_diretor"),
  ids_linguagens: idsDaLista(filme?.linguagens, "id_linguagem"),
  ids_paises: idsDaLista(filme?.paises, "id_pais"),
  ids_produtoras: idsDaLista(filme?.produtoras, "id_produtora"),
});

export default function FilmeDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [filme, setFilme] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState(criarFormulario(null));
  const [auxiliares, setAuxiliares] = useState(AUXILIARES_VAZIOS);
  const [buscas, setBuscas] = useState({});
  const admin = usuarioEhAdmin();

  useEffect(() => {
    const buscarDetalhes = async () => {
      if (!id) {
        setErro("ID do filme nao informado.");
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);
        setErro("");

        const resposta = await fetch(`${API_URL}/filmes/${id}`);

        if (!resposta.ok) {
          throw new Error("Filme nao encontrado.");
        }

        const dados = await resposta.json();
        setFilme(dados);
        setForm(criarFormulario(dados));
      } catch (erroBusca) {
        console.error("Erro ao buscar filme:", erroBusca);
        setFilme(null);
        setErro(erroBusca.message || "Erro ao buscar filme.");
      } finally {
        setCarregando(false);
      }
    };

    buscarDetalhes();
  }, [id]);

  useEffect(() => {
    if (!admin) return;

    const buscarAuxiliares = async () => {
      try {
        const [
          respAtores,
          respCategorias,
          respDiretores,
          respLinguagens,
          respPaises,
          respProdutoras,
        ] = await Promise.all([
          fetch(`${API_URL}/dados/atores`),
          fetch(`${API_URL}/dados/categorias`),
          fetch(`${API_URL}/dados/diretores`),
          fetch(`${API_URL}/dados/linguagens`),
          fetch(`${API_URL}/dados/paises`),
          fetch(`${API_URL}/dados/produtoras`),
        ]);

        setAuxiliares({
          atores: respAtores.ok ? await respAtores.json() : [],
          categorias: respCategorias.ok ? await respCategorias.json() : [],
          diretores: respDiretores.ok ? await respDiretores.json() : [],
          linguagens: respLinguagens.ok ? await respLinguagens.json() : [],
          paises: respPaises.ok ? await respPaises.json() : [],
          produtoras: respProdutoras.ok ? await respProdutoras.json() : [],
        });
      } catch (erroAuxiliares) {
        console.error("Erro ao buscar dados auxiliares:", erroAuxiliares);
      }
    };

    buscarAuxiliares();
  }, [admin]);

  const normalizarLista = (valor) => {
    if (!valor) return [];
    if (Array.isArray(valor)) return valor;

    if (typeof valor === "string") {
      try {
        const parsed = JSON.parse(valor);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return valor
          .split(",")
          .map((nome) => ({ nome: nome.trim() }))
          .filter((item) => item.nome);
      }
    }

    return [];
  };

  const nomeItem = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;

    const partes = [item.nome, item.sobrenome].filter(Boolean);
    return partes.join(" ");
  };

  const formatarLista = (valor) => {
    const nomes = normalizarLista(valor).map(nomeItem).filter(Boolean);
    return nomes.length > 0 ? nomes.join(", ") : "Nao informado";
  };

  const formatarDuracao = (valor) => {
    if (!valor) return "Nao informada";
    if (typeof valor !== "string") return String(valor);

    const [horas, minutos] = valor.split(":").map(Number);
    if (Number.isNaN(horas) || Number.isNaN(minutos)) return valor;

    if (horas > 0) return `${horas}h ${String(minutos).padStart(2, "0")}min`;
    return `${minutos}min`;
  };

  const formatarOrcamento = (valor) => {
    if (!valor) return "Nao informado";

    const numero = Number(valor);
    if (Number.isNaN(numero)) return "Nao informado";

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "USD",
    });
  };

  const atualizarCampo = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  };

  const alternarItemLista = (campo, itemId) => {
    const itemIdTexto = String(itemId);

    setForm((atual) => {
      const selecionados = atual[campo];
      const proximaLista = selecionados.includes(itemIdTexto)
        ? selecionados.filter((idSelecionado) => idSelecionado !== itemIdTexto)
        : [...selecionados, itemIdTexto];

      return { ...atual, [campo]: proximaLista };
    });
  };

  const removerItemLista = (campo, itemId) => {
    const itemIdTexto = String(itemId);

    setForm((atual) => ({
      ...atual,
      [campo]: atual[campo].filter((idSelecionado) => idSelecionado !== itemIdTexto),
    }));
  };

  const atualizarBusca = (campo, valor) => {
    setBuscas((atual) => ({ ...atual, [campo]: valor }));
  };

  const cancelarEdicao = () => {
    setForm(criarFormulario(filme));
    setEditando(false);
  };

  const salvarEdicao = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const payload = {
      titulo: form.titulo.trim(),
      ano: form.ano ? Number(form.ano) : null,
      duracao: form.duracao.trim() || null,
      orcamento: form.orcamento ? Number(form.orcamento) : null,
      sinopse: form.sinopse.trim() || null,
      poster: form.poster.trim() || null,
      banner: form.banner.trim() || null,
      trailer: form.trailer.trim() || null,
      ids_atores: form.ids_atores.map(Number),
      ids_categorias: form.ids_categorias.map(Number),
      ids_diretores: form.ids_diretores.map(Number),
      ids_linguagens: form.ids_linguagens.map(Number),
      ids_paises: form.ids_paises.map(Number),
      ids_produtoras: form.ids_produtoras.map(Number),
    };

    try {
      setSalvando(true);

      const resposta = await fetch(`${API_URL}/filmes/${id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!resposta.ok) {
        const erroResposta = await resposta.json().catch(() => null);
        throw new Error(erroResposta?.detail || "Erro ao atualizar filme.");
      }

      const filmeAtualizado = await resposta.json();
      setFilme(filmeAtualizado);
      setForm(criarFormulario(filmeAtualizado));
      setEditando(false);
      alert("Filme atualizado com sucesso!");
    } catch (erroSalvar) {
      console.error("Erro ao atualizar filme:", erroSalvar);
      alert(erroSalvar.message || "Erro ao atualizar filme.");
    } finally {
      setSalvando(false);
    }
  };

  const renderizarSeletorMultiplo = (label, campo, itens, campoId) => {
    const termoBusca = buscas[campo] || "";
    const selecionados = form[campo];
    const itensSelecionados = itens.filter((item) =>
      selecionados.includes(String(idDoItem(item, campoId)))
    );
    const itensFiltrados = itens.filter((item) =>
      nomeItem(item).toLowerCase().includes(termoBusca.toLowerCase())
    );

    return (
      <div className="grupo-edicao seletor-multiplo">
        <span>{label}</span>

        <input
          value={termoBusca}
          onChange={(event) => atualizarBusca(campo, event.target.value)}
          placeholder={`Buscar ${label.toLowerCase()}`}
        />

        <div className="chips-selecionados">
          {itensSelecionados.length > 0 ? (
            itensSelecionados.map((item) => {
              const itemId = idDoItem(item, campoId);
              return (
                <button
                  key={itemId}
                  type="button"
                  className="chip-selecionado"
                  onClick={() => removerItemLista(campo, itemId)}
                >
                  {nomeItem(item)}
                  <X size={14} />
                </button>
              );
            })
          ) : (
            <small>Nenhum selecionado</small>
          )}
        </div>

        <div className="lista-opcoes-multipla">
          {itensFiltrados.length > 0 ? (
            itensFiltrados.map((item) => {
              const itemId = idDoItem(item, campoId);
              const itemIdTexto = String(itemId);
              const selecionado = selecionados.includes(itemIdTexto);

              return (
                <button
                  key={itemId}
                  type="button"
                  className={`opcao-multipla${selecionado ? " selecionada" : ""}`}
                  onClick={() => alternarItemLista(campo, itemId)}
                >
                  <span className="checkbox-multiplo">{selecionado ? "✓" : ""}</span>
                  <span>{nomeItem(item)}</span>
                </button>
              );
            })
          ) : (
            <p className="sem-opcoes-multipla">Nenhum resultado.</p>
          )}
        </div>
      </div>
    );
  };

  if (carregando) {
    return <div className="carregando-detalhes">Carregando detalhes...</div>;
  }

  if (!filme) {
    return (
      <div className="filme-nao-encontrado">
        <h2>{erro || "Filme nao encontrado."}</h2>
        <button onClick={() => navigate(-1)}>Voltar</button>
      </div>
    );
  }

  const categorias = normalizarLista(filme.categorias);
  const atores = normalizarLista(filme.atores);
  const poster = filme.poster || filme.imagem || POSTER_PADRAO;
  const paises = filme.paises?.length ? filme.paises : filme.pais_origem ? [filme.pais_origem] : [];

  return (
    <div className="pagina-filme-detalhes">
      <div className="detalhes-container-interno">
        <button className="btn-voltar" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Voltar
        </button>

        <div className="conteudo-principal-detalhes">
          <div className="area-poster">
            <img src={poster} alt={filme.titulo} className="poster-grande" />
          </div>

          <div className="area-infos">
            <h1 className="detalhes-titulo">{filme.titulo}</h1>

            <div className="detalhes-header-infos">
              <span className="detalhes-ano">{filme.ano || "Ano nao informado"}</span>
              <div className="detalhes-tags">
                {categorias.length > 0 ? (
                  categorias.map((categoria, index) => (
                    <span key={categoria.id_categoria || categoria.id || index} className="tag">
                      {nomeItem(categoria)}
                    </span>
                  ))
                ) : (
                  <span className="tag">Sem genero</span>
                )}
              </div>
            </div>

            <p className="detalhes-sinopse">
              {filme.sinopse || "Sinopse nao disponivel para este filme."}
            </p>

            <div className="detalhes-botoes-acao">
              <button className="btn-favoritado">
                <Heart size={18} fill="currentColor" />
                Favoritado
              </button>
              {admin ? (
                <button className="btn-solicitar-edicao" onClick={() => setEditando(true)}>
                  <Pencil size={18} />
                  Editar Filme
                </button>
              ) : (
                <button className="btn-solicitar-edicao">
                  <Send size={18} />
                  Solicitar Edicao
                </button>
              )}
            </div>

            {admin && editando && (
              <form className="form-edicao-filme" onSubmit={salvarEdicao}>
                <div className="form-edicao-header">
                  <h2>Editar dados do filme</h2>
                  <button type="button" className="btn-cancelar-edicao" onClick={cancelarEdicao}>
                    <X size={18} />
                    Cancelar
                  </button>
                </div>

                <div className="grid-edicao">
                  <label className="grupo-edicao">
                    <span>Titulo</span>
                    <input value={form.titulo} onChange={(event) => atualizarCampo("titulo", event.target.value)} required />
                  </label>

                  <label className="grupo-edicao">
                    <span>Ano</span>
                    <input type="number" value={form.ano} onChange={(event) => atualizarCampo("ano", event.target.value)} />
                  </label>

                  <label className="grupo-edicao">
                    <span>Duracao</span>
                    <input value={form.duracao} onChange={(event) => atualizarCampo("duracao", event.target.value)} placeholder="HH:MM:SS" />
                  </label>

                  <label className="grupo-edicao">
                    <span>Orcamento</span>
                    <input type="number" value={form.orcamento} onChange={(event) => atualizarCampo("orcamento", event.target.value)} />
                  </label>

                  <label className="grupo-edicao grupo-edicao-largo">
                    <span>Sinopse</span>
                    <textarea value={form.sinopse} onChange={(event) => atualizarCampo("sinopse", event.target.value)} rows={5} />
                  </label>

                  <label className="grupo-edicao grupo-edicao-largo">
                    <span>Poster</span>
                    <input value={form.poster} onChange={(event) => atualizarCampo("poster", event.target.value)} />
                  </label>

                  <label className="grupo-edicao grupo-edicao-largo">
                    <span>Banner</span>
                    <input value={form.banner} onChange={(event) => atualizarCampo("banner", event.target.value)} />
                  </label>

                  <label className="grupo-edicao grupo-edicao-largo">
                    <span>Trailer</span>
                    <input value={form.trailer} onChange={(event) => atualizarCampo("trailer", event.target.value)} />
                  </label>

                  {renderizarSeletorMultiplo("Categorias", "ids_categorias", auxiliares.categorias, "id_categoria")}
                  {renderizarSeletorMultiplo("Diretores", "ids_diretores", auxiliares.diretores, "id_diretor")}
                  {renderizarSeletorMultiplo("Atores", "ids_atores", auxiliares.atores, "id_ator")}
                  {renderizarSeletorMultiplo("Produtoras", "ids_produtoras", auxiliares.produtoras, "id_produtora")}
                  {renderizarSeletorMultiplo("Paises", "ids_paises", auxiliares.paises, "id_pais")}
                  {renderizarSeletorMultiplo("Idiomas", "ids_linguagens", auxiliares.linguagens, "id_linguagem")}
                </div>

                <button type="submit" className="btn-salvar-edicao" disabled={salvando}>
                  <Save size={18} />
                  {salvando ? "Salvando..." : "Salvar alteracoes"}
                </button>
              </form>
            )}

            <div className="grid-metadados">
              <div className="card-meta">
                <span className="meta-label">DIRETOR</span>
                <span className="meta-valor">{formatarLista(filme.diretores)}</span>
              </div>
              <div className="card-meta">
                <span className="meta-label">DURACAO</span>
                <span className="meta-valor">{formatarDuracao(filme.duracao)}</span>
              </div>
              <div className="card-meta">
                <span className="meta-label">PRODUTORA</span>
                <span className="meta-valor">{formatarLista(filme.produtoras)}</span>
              </div>
              <div className="card-meta">
                <span className="meta-label">ORCAMENTO</span>
                <span className="meta-valor">{formatarOrcamento(filme.orcamento)}</span>
              </div>
              <div className="card-meta">
                <span className="meta-label">PAIS</span>
                <span className="meta-valor">{formatarLista(paises)}</span>
              </div>
              <div className="card-meta">
                <span className="meta-label">IDIOMA</span>
                <span className="meta-valor">{formatarLista(filme.linguagens)}</span>
              </div>
            </div>

            <div className="secao-elenco">
              <h2>Elenco</h2>
              <div className="lista-elenco">
                {atores.length > 0 ? (
                  atores.map((ator, index) => (
                    <div key={ator.id_ator || ator.id || index} className="ator-card">
                      <div className="ator-avatar">
                        <User size={32} color="#666" />
                      </div>
                      <span className="ator-nome">{nomeItem(ator)}</span>
                    </div>
                  ))
                ) : (
                  <p className="elenco-vazio">Elenco nao informado.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
