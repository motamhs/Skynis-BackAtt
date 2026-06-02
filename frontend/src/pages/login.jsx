import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Globe, Mail } from "lucide-react";
import LogoSkynis from "../assets/logo Skynis.svg?react";
import "./css/login.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const formData = new URLSearchParams();
            formData.append("email", email);
            formData.append("password", senha);

            const resposta = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
               
                body: JSON.stringify({ email: email, senha: senha }),
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                console.log("Login backend feito com sucesso!");

                localStorage.setItem("access_token", dados.access_token);
                localStorage.setItem("refresh_token", dados.refresh_token);

                navigate("/");
            } else {
                alert(dados.error || "Erro ao fazer login. Verifique suas credenciais.");
            }
        } catch (erro) {
            console.error("Erro na requisição:", erro);
            alert("Erro ao conectar com o servidor.");
        }
    };

    return (
        <div className="pagina-login">
            <header className="header-login">
                <Link to="/" className="logo-link">
                    <LogoSkynis className="logo-svg" />
                </Link>
            </header>

            <main className="container-login">
                <div className="card-login">
                    <h1>Entrar</h1>

                    <form onSubmit={handleLogin} className="form-login">
                        <div className="grupo-input">
                            <input
                                type="text"
                                placeholder="E-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <Mail className="icone-input" />
                        </div>

                        <div className="grupo-input">
                            <input
                                type={mostrarSenha ? "text" : "password"}
                                placeholder="Senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                            />

                            {mostrarSenha ? (
                                <EyeOff
                                    className="icone-input clicavel"
                                    onClick={() => setMostrarSenha(!mostrarSenha)}
                                />
                            ) : (
                                <Eye
                                className="icone-input clicavel"
                                onClick={() => setMostrarSenha(!mostrarSenha)}
                                />
                            )}
                        </div>

                        <button type="submit" className="btn-entrar-form">
                            Entrar
                        </button>
                    </form>

                    <div className="divisor">
                        <span>OU</span>
                    </div>

                    <div className="botoes-alternativos">
                        <button type="button" className="btn-alternativo">

                            <Globe size={18} />
                            Continuar com Google
                        </button>
                    </div>

                    <p className="link-cadastro">
                        Não tem conta ? <Link to="/cadastro">Cadastre-se</Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
