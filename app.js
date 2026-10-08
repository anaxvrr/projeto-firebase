import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// Substitua com as configurações do seu Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_DOMINIO.firebaseapp.com",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_BUCKET.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Requisito 4: Validar a sessão com onAuthStateChanged
onAuthStateChanged(auth, (user) => {
    const isDashboard = window.location.pathname.includes("dashboard.html");
    
    if (user) {
        // Se estiver logado e na tela de login, redireciona para a área restrita
        if (!isDashboard) {
            window.location.href = "dashboard.html";
        } else {
            // Requisito 5: Exibir Nome e E-mail
            document.getElementById("dadosUsuario").innerHTML = `Bem-vindo(a), ${user.displayName || 'Usuário'}<br>E-mail: ${user.email}`;
        }
    } else {
        // Se tentar acessar a área restrita sem login, redireciona para index
        if (isDashboard) {
            window.location.href = "index.html";
        }
    }
});

// Requisito 1: Login com Google
const btnGoogle = document.getElementById("btnGoogle");
if (btnGoogle) {
    btnGoogle.addEventListener("click", async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const usuario = result.user;
            
            // Desafio Bônus: Registrar histórico de acessos no Firestore
            await addDoc(collection(db, "historico_acessos"), {
                nome: usuario.displayName,
                email: usuario.email,
                ultimoAcesso: new Date()
            });
        } catch (error) {
            console.error("Erro no login com Google:", error);
            alert("Falha ao entrar com Google.");
        }
    });
}

// Requisito 2 e 3: Cadastro com E-mail/Senha e Validação de Duplicidade
const btnCadastrar = document.getElementById("btnCadastrar");
if (btnCadastrar) {
    btnCadastrar.addEventListener("click", async () => {
        const nome = document.getElementById("nome").value;
        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;

        if (!nome || !email || !senha) return alert("Preencha todos os campos obrigatórios.");

        try {
            // Requisito 3: Verificar se o e-mail já existe no Firestore
            const q = query(collection(db, "usuarios"), where("email", "==", email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Regra: Alerta exato conforme a instrução da atividade
                alert("Este e-mail já está cadastrado.");
                return; 
            }

            // Realiza o cadastro no Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
            await updateProfile(userCredential.user, { displayName: nome });

            // Grava os dados do novo usuário na coleção Firestore
            await addDoc(collection(db, "usuarios"), {
                nome: nome,
                email: email
            });

        } catch (error) {
            console.error("Erro ao cadastrar:", error);
            alert("Erro ao realizar cadastro. A senha deve ter no mínimo 6 caracteres.");
        }
    });
}

// Requisito 6: Botão de Sair / Logout
const btnSair = document.getElementById("btnSair");
if (btnSair) {
    btnSair.addEventListener("click", () => {
        signOut(auth).catch((error) => console.error("Erro ao sair:", error));
    });
}
