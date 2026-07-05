# Avaliação Técnica - Desenvolvedor Front-end (Angular)

Este repositório reúne as respostas da avaliação técnica para a vaga de **Desenvolvedor Front-end (Angular)**.

As respostas contemplam desde conceitos de **TypeScript**, **RxJS**, **Angular**, **Angular Signals** e **NgRx**, além da implementação prática da questão **3.2 – Gerenciamento de Estado com NgRx (Feature To-do)**.

---<img width="1891" height="893" alt="Captura de tela 2026-07-05 161914" src="https://github.com/user-attachments/assets/87e746cd-100c-470b-9654-79415b55c5d4" />
<img width="1891" height="893" alt="Captura de tela 2026-07-05 161914" src="https://github.com/user-attachments/assets/f7c7b109-3455-4e7e-8748-25e8bd8ad118" />


# Questão 3.2 – Gerenciamento de Estado com NgRx

Foi desenvolvido um projeto Angular utilizando **NgRx** para demonstrar a implementação completa da Feature **To-do**, contemplando todos os requisitos solicitados na avaliação.

## Funcionalidades implementadas

- Actions
  - `loadTodos`
  - `loadTodosSuccess`
  - `loadTodosError`
  - `toggleTodoComplete`

- Reducer utilizando `createReducer`

- Selectors
  - `selectAllTodos`
  - `selectPendingTodos`

- Effect para carregamento assíncrono utilizando RxJS

- Estrutura organizada seguindo as boas práticas do NgRx

- Projeto Angular Standalone

---

# Demonstração

## Aplicação publicada

🌐 https://respostas-desafio-7dzl.vercel.app/

---

## Interface da aplicação
<img width="1891" height="893" alt="1" src="https://github.com/user-attachments/assets/16499482-1dc7-451b-9221-ba647c02003b" />
---

# Como executar o projeto localmente

Clone o repositório:

```bash
git clone https://github.com/Nambundo/attus-ngrx-exercicio.git
```

Entre na pasta do projeto:

```bash
cd attus-ngrx-exercicio
```

Instale as dependências:

```bash
npm install
```

Execute o projeto:

```bash
npm start
```

ou

```bash
ng serve
```

Acesse:

```text
http://localhost:4200
```

---

# Gerar Build

```bash
npm run build
```

---

# Estrutura do projeto

```
src/
├── app/
│   ├── todos/
│   │   ├── todo.actions.ts
│   │   ├── todo.effects.ts
│   │   ├── todo.model.ts
│   │   ├── todo.reducer.ts
│   │   ├── todo.selectors.ts
│   │   ├── todo.service.ts
│   │   └── todo-list.component.ts
│   │
│   ├── app.component.ts
│   └── app.config.ts
│
├── main.ts
└── styles.css
```

---

# Objetivo

Demonstrar conhecimentos em:

- TypeScript
- Angular
- RxJS
- NgRx
- Angular Signals
- Gerenciamento de Estado
- Boas práticas de desenvolvimento Front-end

---

# Autor

**Jones Márcio Nambundo**

GitHub:

https://github.com/Nambundo
