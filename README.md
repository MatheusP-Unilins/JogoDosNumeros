# 🎯 Jogo dos Números • Edição Cajuá

Um jogo interativo e vibrante de adivinhação de números com 3 modos de dificuldade, validações estritas de palpites, ranking/pódio em tempo real e persistência com **Neon PostgreSQL** e deploy na **Vercel**.

Projeto inspirado na identidade visual tropical e vibrante brasileira da linha de copos **Cajuá / Smoosh** (com tons terrosos e quentes, paleta amarela, laranja, verde, azul e estética pop art com bordas marcadas).

---

## 🚀 Funcionalidades

1. **3 Níveis de Dificuldade**:
   - **Iniciante**: Número secreto entre `1` e `10`, com `5 chances`.
   - **Intermediário**: Número secreto entre `1` e `100`, com `10 chances`.
   - **Avançado**: Número secreto entre `1` e `1.000`, com `15 chances`.

2. **Regras e Validações Estritas**:
   - Dica em tempo real se o valor correto é **maior** ou **menor** que o chute feito.
   - **Bloqueio de Duplicados**: Não permite chutar o mesmo número duas vezes, exibe mensagem *"Valor duplicado, já foi usado"* e **não consome chance**.
   - **Bloqueio de Extrapolação**: Impede números maiores que o limite ou menores que 1, exibe mensagem informativa (ex: *"Valor acima do valor máximo possível (Maior que 100)"*) e **não consome chance**.
   - **Contador Exato**: Contabiliza somente os chutes válidos até o acerto.

3. **Pódio e Hall da Fama (Ranking)**:
   - Pódio com 1º, 2º e 3º lugares com troféu, coroa e medalhas para cada um dos 3 modos.
   - Lista do 4º ao 10º colocado.
   - Critério de desempate: menor número de chutes válidos e data mais antiga.

4. **Banco de Dados Neon Serverless**:
   - Integração automática com `@neondatabase/serverless`.
   - Criação automática da tabela `scores` na primeira execução caso ainda não exista.
   - Fallback inteligente com dados mockados em memória para execução local mesmo se nenhuma variável de ambiente estiver configurada no início.

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS com tipografia Google Fonts (*Fredoka* e *Plus Jakarta Sans*)
- **Efeitos e Ícones**: Lucide React & Canvas-Confetti
- **Banco de Dados**: PostgreSQL Serverless (Neon.tech)
- **Hospedagem & CI/CD**: Vercel

---

## 📦 Como Rodar Localmente

1. Clone o repositório ou acesse a pasta do projeto:
```bash
git clone https://github.com/MatheusP-Unilins/JogoDosNumeros.git
cd JogoDosNumeros
```

2. Instale as dependências:
```bash
npm install
```

3. (Opcional) Configure sua string do Neon no arquivo `.env.local`:
```env
DATABASE_URL=postgresql://neondb_owner:suasenha@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```
*(Se não configurar nenhuma variável, o jogo funciona normalmente com armazenamento em memória temporário).*

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🌐 Deploy na Vercel e Banco Neon

### Passo 1: Criar o banco no Neon (Leva 1 minuto)
1. Acesse [https://neon.tech](https://neon.tech) e crie uma conta gratuita (pode entrar com o próprio GitHub).
2. Clique em **"Create Project"** (Dê o nome de `jogodosnumeros`).
3. Na tela principal (*Dashboard*), você verá a caixa **Connection Details**. Copie a URL completa que começa com `postgresql://...`.

### Passo 2: Importar na Vercel
1. Acesse [https://vercel.com](https://vercel.com) e conecte com seu GitHub.
2. Clique em **"Add New..."** > **"Project"**.
3. Selecione o repositório **`MatheusP-Unilins/JogoDosNumeros`**.
4. Em **Environment Variables**, adicione:
   - **Key**: `DATABASE_URL`
   - **Value**: Cole a URL que você copiou no Neon.
5. Clique em **Deploy**.

> 💡 **Nota sobre atualizações**: Após importar uma vez na Vercel, você **NÃO precisa importar de novo**. Toda vez que fizermos um `git push` no repositório, a Vercel detecta a atualização automaticamente e faz um novo deploy em poucos segundos!
