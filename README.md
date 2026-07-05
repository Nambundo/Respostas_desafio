# Avaliação Técnica - Desenvolvedor Front-end (Angular)

Este repositório reúne as respostas das questões teóricas da avaliação técnica para a vaga de **Desenvolvedor Front-end (Angular)**.

## Conteúdo

As respostas implementadas neste repositório contemplam as seguintes questões:

- ✅ 1.1 Refatoração (TypeScript e Qualidade de Código)
- ✅ 1.2 Generics e Tipos Utilitários
- ✅ 2.1 Change Detection e OnPush
- ✅ 2.2 RxJS – Eliminando Subscriptions Aninhadas
- ✅ 2.3 RxJS – Busca com Debounce
- ✅ 2.4 Performance – OnPush e trackBy
- ✅ 3.1 Angular Signals – Estado Local

As respostas completas podem ser consultadas em:

**📄 Respostas.md**

---

# Questão 3.2 – Gerenciamento de Estado com NgRx

A implementação prática da questão **3.2 (Feature To-do utilizando NgRx)** foi desenvolvida em um projeto Angular separado.

### Funcionalidades implementadas

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

- Projeto desenvolvido em Angular Standalone

### Interface da aplicação

![Todo List](./todo-list.png)

---

## Repositório do projeto Angular

**GitHub:**

https://github.com/Nambundo/attus-ngrx-exercicio

---

## Tecnologias utilizadas

- Angular 17+
- TypeScript
- RxJS
- NgRx
- Angular Signals

---

## Autor

Jones Márcio Nambundo
