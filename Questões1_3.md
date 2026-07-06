# Questões e Respostas — TypeScript, Angular e NgRx

> Documento consolidado com as perguntas feitas e as respectivas respostas técnicas.

## 1.1 Refatoração

### Pergunta

Considerando conhecimentos de TypeScript, qualidade de código e boas práticas, quais melhorias seriam feitas no seguinte código:

```typescript
class Produto {
  id: any;
  descricao: any;
  quantidadeEstoque: any;

  constructor(id: any, descricao: any, quantidadeEstoque: any) {
    this.id = id;
    this.descricao = descricao;
    this.quantidadeEstoque = quantidadeEstoque;
  }
}

class Verdureira {
  produtos: any;

  constructor() {
    this.produtos = [
      new Produto(1, 'Maçã', 20),
      new Produto(2, 'Laranja', 0),
      new Produto(3, 'Limão', 20)
    ];
  }

  getDescricaoProduto(produtoId: any) {
    let produto;

    for (let index = 0; index < this.produtos.length; index++) {
      if (this.produtos[index].id == produtoId) {
        produto = this.produtos[index];
      }
    }

    return produto.id + ' - ' + produto.descricao + ' (' + produto.quantidadeEstoque + 'x)';
  }

  hasEstoqueProduto(produtoId: any) {
    let produto;

    for (let index = 0; index < this.produtos.length; index++) {
      if (this.produtos[index].id == produtoId) {
        produto = this.produtos[index];
      }
    }

    if (produto.quantidadeEstoque > 0) {
      return true;
    } else {
      return false;
    }
  }
}
```

### Resposta

#### Problemas identificados

1. **Uso excessivo de `any`** — anula completamente as vantagens do TypeScript (checagem de tipos, autocomplete, refatoração segura).
2. **Código duplicado** — a lógica de buscar um produto por `id` está repetida em `getDescricaoProduto` e `hasEstoqueProduto`.
3. **Uso de `==`** em vez de `===` — pode gerar comparações inesperadas por coerção de tipos.
4. **Ausência de tratamento de erro** — se o `produtoId` não existir, `produto` fica `undefined` e o código quebra.
5. **Loops manuais** onde `Array.find` seria mais idiomático e legível.
6. **`if/else` retornando booleano** — pode ser simplificado para uma expressão direta.
7. **Falta de encapsulamento** — atributos públicos sem necessidade, sem `readonly` onde caberia.
8. **Concatenação de strings** em vez de template literals.

#### Código refatorado

```typescript
class Produto {
  constructor(
    public readonly id: number,
    public readonly descricao: string,
    private quantidadeEstoque: number
  ) {}

  get temEstoque(): boolean {
    return this.quantidadeEstoque > 0;
  }

  get quantidade(): number {
    return this.quantidadeEstoque;
  }

  toString(): string {
    return `${this.id} - ${this.descricao} (${this.quantidadeEstoque}x)`;
  }
}

class ProdutoNaoEncontradoError extends Error {
  constructor(produtoId: number) {
    super(`Produto com id ${produtoId} não foi encontrado.`);
    this.name = 'ProdutoNaoEncontradoError';
  }
}

class Verdureira {
  private readonly produtos: Produto[] = [
    new Produto(1, 'Maçã', 20),
    new Produto(2, 'Laranja', 0),
    new Produto(3, 'Limão', 20),
  ];

  private buscarProduto(produtoId: number): Produto {
    const produto = this.produtos.find((p) => p.id === produtoId);

    if (!produto) {
      throw new ProdutoNaoEncontradoError(produtoId);
    }

    return produto;
  }

  getDescricaoProduto(produtoId: number): string {
    return this.buscarProduto(produtoId).toString();
  }

  hasEstoqueProduto(produtoId: number): boolean {
    return this.buscarProduto(produtoId).temEstoque;
  }
}
```

#### Por que cada mudança importa

- **Tipos explícitos**: garante checagem em tempo de compilação e documenta a intenção do código.
- **`readonly` no `id` e `descricao`**: campos que não deveriam mudar depois de criados.
- **`quantidadeEstoque` privado + getters**: encapsula o estado interno.
- **`buscarProduto` centralizado**: elimina duplicação e centraliza a lógica de busca.
- **`Array.find`**: mais declarativo e idiomático em JS/TS moderno.
- **Erro customizado (`ProdutoNaoEncontradoError`)**: torna explícito o caso de falha.
- **`===`**: evita bugs sutis de coerção de tipo.
- **`toString()` no `Produto`**: move a formatação de exibição para a própria entidade.
- **`temEstoque` como getter booleano**: substitui `if/else` redundante por expressão direta.

## 1.2. Generics e tipos utilitários

### Pergunta

Implementar uma função genérica `filtrarEPaginar<T>` que recebe um array, um predicado de filtro e parâmetros de paginação (página e tamanho). A função deve retornar os itens da página atual e o total de registros filtrados. Usar tipagem completa — sem `any`.

```typescript
filtrarEPaginar<T>(
  data: T[],
  filterFn: (item: T) => boolean,
  params: PaginaParams
): Pagina<T>
```

### Resposta

```typescript
interface PaginaParams {
  pagina: number;   // 1-based
  tamanho: number;  // itens por página
}

interface Pagina<T> {
  itens: T[];
  totalRegistros: number;
  totalPaginas: number;
  paginaAtual: number;
  tamanhoPagina: number;
  temProximaPagina: boolean;
  temPaginaAnterior: boolean;
}

class ParametrosPaginacaoInvalidosError extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ParametrosPaginacaoInvalidosError';
  }
}

function filtrarEPaginar<T>(
  data: T[],
  filterFn: (item: T) => boolean,
  params: PaginaParams
): Pagina<T> {
  const { pagina, tamanho } = params;

  if (pagina < 1) {
    throw new ParametrosPaginacaoInvalidosError('O número da página deve ser >= 1.');
  }

  if (tamanho < 1) {
    throw new ParametrosPaginacaoInvalidosError('O tamanho da página deve ser >= 1.');
  }

  const itensFiltrados = data.filter(filterFn);
  const totalRegistros = itensFiltrados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / tamanho));

  const indiceInicial = (pagina - 1) * tamanho;
  const itens = itensFiltrados.slice(indiceInicial, indiceInicial + tamanho);

  return {
    itens,
    totalRegistros,
    totalPaginas,
    paginaAtual: pagina,
    tamanhoPagina: tamanho,
    temProximaPagina: pagina < totalPaginas,
    temPaginaAnterior: pagina > 1,
  };
}
```

#### Exemplo de uso

```typescript
interface Produto {
  id: number;
  descricao: string;
  quantidadeEstoque: number;
}

const produtos: Produto[] = [
  { id: 1, descricao: 'Maçã', quantidadeEstoque: 20 },
  { id: 2, descricao: 'Laranja', quantidadeEstoque: 0 },
  { id: 3, descricao: 'Limão', quantidadeEstoque: 15 },
  { id: 4, descricao: 'Banana', quantidadeEstoque: 5 },
  { id: 5, descricao: 'Uva', quantidadeEstoque: 0 },
];

const resultado = filtrarEPaginar(
  produtos,
  (p) => p.quantidadeEstoque > 0,
  { pagina: 1, tamanho: 2 }
);
```

#### Decisões de design

- **`T` inferido automaticamente** — API ergonômica, sem anotação explícita.
- **Validação de parâmetros com erro customizado** — falha explícita para página/tamanho inválidos.
- **`totalPaginas` com `Math.max(1, ...)`** — evita "0 páginas" quando não há registros.
- **Metadados extras** (`temProximaPagina`, `temPaginaAnterior`) — comuns em APIs de paginação reais.
- **Filtro aplicado antes da paginação** — `totalRegistros` reflete o total pós-filtro.
- **Sem `any` em nenhum ponto**.


## 2.1. Angular — Change Detection e OnPush

### Pergunta

O componente abaixo usa `ChangeDetectionStrategy.OnPush`, mas o nome não é exibido na tela. Identificar o problema, explicar o motivo e propor a correção — sem alterar a estratégia, sem modificar `PessoaService` e sem remover o `setInterval`.

```typescript
import { ChangeDetectionStrategy, Component, Injectable, OnInit, OnDestroy } from '@angular/core';
import { of, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable()
class PessoaService {
  buscarPorId(id: number) {
    return of({ id, nome: 'João' }).pipe(delay(500));
  }
}

@Component({
  selector: 'app-root',
  providers: [PessoaService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1>{{ texto }}</h1>`,
})
export class AppComponent implements OnInit, OnDestroy {
  texto: string;
  contador = 0;
  subscriptionBuscarPessoa: Subscription;
  constructor(private readonly pessoaService: PessoaService) {}

  ngOnInit(): void {
    this.subscriptionBuscarPessoa = this.pessoaService.buscarPorId(1).subscribe((pessoa) => {
      this.texto = `Nome: ${pessoa.nome}`;
    });

    setInterval(() => this.contador++, 1000);
  }

  ngOnDestroy(): void {
    /** ... */
  }
}
```

### Resposta

#### O problema

Com `OnPush`, o Angular só executa change detection quando ocorre um destes gatilhos:

1. Um `@Input()` recebe uma nova referência;
2. Um evento do DOM disparado dentro do próprio template do componente;
3. Um `Observable` vinculado via `async pipe` emite um novo valor;
4. Chamada manual de `ChangeDetectorRef.markForCheck()` (ou `detectChanges()`).

O `subscribe()` altera `this.texto` fora desses gatilhos, então o Angular nunca "revisita" o componente — a interpolação `{{ texto }}` nunca é atualizada. O mesmo problema afeta o `setInterval`/`contador`.

#### Correção (sem trocar a estratégia)

```typescript
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injectable,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { of, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable()
class PessoaService {
  buscarPorId(id: number) {
    return of({ id, nome: 'João' }).pipe(delay(500));
  }
}

@Component({
  selector: 'app-root',
  providers: [PessoaService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1>{{ texto }}</h1>`,
})
export class AppComponent implements OnInit, OnDestroy {
  texto = '';
  contador = 0;

  private subscriptionBuscarPessoa: Subscription | undefined;
  private intervalId: ReturnType<typeof setInterval> | undefined;

  constructor(
    private readonly pessoaService: PessoaService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscriptionBuscarPessoa = this.pessoaService
      .buscarPorId(1)
      .subscribe((pessoa) => {
        this.texto = `Nome: ${pessoa.nome}`;
        this.cdr.markForCheck();
      });

    this.intervalId = setInterval(() => {
      this.contador++;
      this.cdr.markForCheck();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.subscriptionBuscarPessoa?.unsubscribe();
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
```

#### O que mudou e por quê

1. **`markForCheck()`** após cada mutação de estado assíncrona, garantindo entrada no próximo ciclo de CD.
2. **`ngOnDestroy` implementado de verdade** — evita memory leak da subscription e do interval.
3. **Referência do `setInterval` guardada** para permitir `clearInterval`.
4. **`texto` inicializado com `''`** evitando erro de "strict property initialization".

#### Alternativa mais idiomática: `async pipe`

```typescript
@Component({
  selector: 'app-root',
  providers: [PessoaService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1>{{ texto$ | async }}</h1>`,
})
export class AppComponent implements OnInit {
  texto$!: Observable<string>;

  constructor(private readonly pessoaService: PessoaService) {}

  ngOnInit(): void {
    this.texto$ = this.pessoaService
      .buscarPorId(1)
      .pipe(map((pessoa) => `Nome: ${pessoa.nome}`));
  }
}
```

Vantagens: sem `unsubscribe()` manual, sem `ChangeDetectorRef` injetado.

---

## 2.2. RxJS — eliminando subscriptions aninhadas

### Pergunta

Refatorar o código abaixo eliminando o `subscribe` dentro de `subscribe`. Usar operadores RxJS adequados, evitar memory leaks e explicar a escolha de operador:

```typescript
ngOnInit(): void {
  const pessoaId = 1;

  this.pessoaService.buscarPorId(pessoaId).subscribe(pessoa => {
    this.pessoaService.buscarQuantidadeFamiliares(pessoaId).subscribe(qtd => {
      this.texto = `Nome: ${pessoa.nome} | familiares: ${qtd}`;
    });
  });
}
```

### Resposta

#### O problema

1. **Duas subscriptions independentes** — cancelar a externa não cancela a interna, gerando memory leaks.
2. **Perda de composição** — tratamento de erro/retry precisaria ser duplicado.
3. **Difícil de ler e testar**.

#### Correção

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { switchMap, map, takeUntil } from 'rxjs/operators';

export class AppComponent implements OnInit, OnDestroy {
  texto = '';

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly pessoaService: PessoaService) {}

  ngOnInit(): void {
    const pessoaId = 1;

    this.pessoaService
      .buscarPorId(pessoaId)
      .pipe(
        switchMap((pessoa) =>
          this.pessoaService
            .buscarQuantidadeFamiliares(pessoaId)
            .pipe(map((qtd) => `Nome: ${pessoa.nome} | familiares: ${qtd}`))
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((texto) => {
        this.texto = texto;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

#### Por que `switchMap`

- **`switchMap`**: cancela a chamada interna anterior se uma nova externa chegar — ideal quando só o resultado mais recente importa.
- **`mergeMap`**: executaria chamadas em paralelo, sem cancelar — risco de race condition.
- **`concatMap`**: enfileira chamadas em ordem — geraria espera desnecessária aqui.
- **`exhaustMap`**: ignora novas emissões enquanto a interna está em andamento — mais adequado para evitar duplo clique em submit.

#### Por que `takeUntil(this.destroy$)`

Combina a subscription com o ciclo de vida do componente: ao emitir em `ngOnDestroy`, cancela toda a cadeia (incluindo o observable interno do `switchMap`) automaticamente.

#### Alternativa com `takeUntilDestroyed` (Angular 16+)

```typescript
import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, map } from 'rxjs/operators';

export class AppComponent implements OnInit {
  texto = '';

  private readonly destroyRef = inject(DestroyRef);

  constructor(private readonly pessoaService: PessoaService) {}

  ngOnInit(): void {
    const pessoaId = 1;

    this.pessoaService
      .buscarPorId(pessoaId)
      .pipe(
        switchMap((pessoa) =>
          this.pessoaService
            .buscarQuantidadeFamiliares(pessoaId)
            .pipe(map((qtd) => `Nome: ${pessoa.nome} | familiares: ${qtd}`))
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((texto) => {
        this.texto = texto;
      });
  }
}
```

Elimina completamente o `ngOnDestroy` manual e o `Subject`.

---

## 2.3. RxJS — busca com debounce

### Pergunta

Implementar um campo de busca reativo em um componente Angular que:

- Aguarde 500 ms após o usuário parar de digitar antes de disparar a requisição (debounce)
- Cancele a requisição anterior caso o usuário digite novamente (evite race condition)
- Exiba um indicador de loading enquanto a requisição está em andamento
- Gerencie a subscription sem memory leak

Mostrar serviço, componente e template com `async pipe`.

### Resposta

#### Serviço

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ResultadoBusca {
  id: number;
  nome: string;
}

@Injectable({ providedIn: 'root' })
export class BuscaService {
  constructor(private readonly http: HttpClient) {}

  buscar(termo: string): Observable<ResultadoBusca[]> {
    return this.http.get<ResultadoBusca[]>('/api/busca', {
      params: { q: termo },
    });
  }
}
```

#### Componente

```typescript
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  filter,
  tap,
  catchError,
  finalize,
} from 'rxjs/operators';
import { BuscaService, ResultadoBusca } from './busca.service';

@Component({
  selector: 'app-busca',
  templateUrl: './busca.component.html',
})
export class BuscaComponent {
  readonly termoBusca = new FormControl<string>('', { nonNullable: true });

  loading = false;
  erro = false;

  readonly resultados$: Observable<ResultadoBusca[]> = this.termoBusca.valueChanges.pipe(
    debounceTime(500),
    distinctUntilChanged(),
    filter((termo) => termo.trim().length > 0),
    tap(() => {
      this.loading = true;
      this.erro = false;
    }),
    switchMap((termo) =>
      this.buscaService.buscar(termo).pipe(
        catchError(() => {
          this.erro = true;
          return of<ResultadoBusca[]>([]);
        }),
        finalize(() => (this.loading = false))
      )
    )
  );

  constructor(private readonly buscaService: BuscaService) {}
}
```

#### Template

```html
<input
  type="text"
  [formControl]="termoBusca"
  placeholder="Digite para buscar..."
/>

@if (loading) {
  <p>Carregando...</p>
}

@if (erro) {
  <p>Ocorreu um erro ao buscar. Tente novamente.</p>
}

<ul>
  @for (item of resultados$ | async; track item.id) {
    <li>{{ item.nome }}</li>
  }
</ul>
```

#### Explicação das escolhas

- **`debounceTime(500)`** — aguarda silêncio de digitação antes de deixar o valor passar.
- **`distinctUntilChanged()`** — evita nova requisição se o valor não mudou de fato.
- **`filter(...)`** — evita buscas para string vazia.
- **`tap` para `loading = true`** — liga o indicador antes da chamada HTTP.
- **`switchMap`** — cancela automaticamente a requisição anterior (race condition).
- **`catchError` dentro do `switchMap`** — trata erro por requisição sem completar o Observable externo.
- **`finalize`** — desliga o loading em sucesso, erro ou cancelamento.
- **`async pipe`** — gerencia a subscription automaticamente, sem `ngOnDestroy`.

#### Nota sobre `OnPush`

Se o componente usar `OnPush`, `loading`/`erro` não refletiriam sozinhos na tela. Solução: unificar tudo em um `estado$` observable:

```typescript
interface EstadoBusca {
  resultados: ResultadoBusca[];
  loading: boolean;
  erro: boolean;
}

readonly estado$: Observable<EstadoBusca> = this.termoBusca.valueChanges.pipe(
  debounceTime(500),
  distinctUntilChanged(),
  filter((termo) => termo.trim().length > 0),
  switchMap((termo) =>
    this.buscaService.buscar(termo).pipe(
      map((resultados) => ({ resultados, loading: false, erro: false })),
      startWith({ resultados: [], loading: true, erro: false }),
      catchError(() => of({ resultados: [], loading: false, erro: true }))
    )
  )
);
```

---

## 2.4 Performance — OnPush e trackBy

### Pergunta

Considerando uma lista com centenas de itens renderizados com `@for` (`ngFor`), explicar:

- Por que usar `trackBy` melhora a performance e como implementá-lo corretamente
- Como `ChangeDetectionStrategy.OnPush` pode reduzir ciclos desnecessários de detecção neste cenário
- Qual seria o impacto de usar a estratégia `Default` neste caso

### Resposta

#### 1. `trackBy` — por que e como

**Sem `trackBy`**: ao receber uma nova referência de array, o Angular compara por identidade de objeto. Se o array inteiro for substituído, o Angular **destrói e recria todos os elementos DOM da lista**, mesmo que a maioria dos dados não tenha mudado — custoso em reflow/repaint, perda de estado de componentes filhos, "piscar" visual.

**Com `trackBy`**, o Angular identifica cada item unicamente (por ID estável), reutilizando elementos DOM existentes e criando/removendo apenas o necessário.

```typescript
interface Produto {
  id: number;
  descricao: string;
  quantidadeEstoque: number;
}

@Component({
  selector: 'app-lista-produtos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul>
      @for (produto of produtos; track produto.id) {
        <li>{{ produto.descricao }} ({{ produto.quantidadeEstoque }}x)</li>
      }
    </ul>
  `,
})
export class ListaProdutosComponent {
  @Input() produtos: Produto[] = [];
}
```

Sintaxe antiga equivalente:

```typescript
trackByProdutoId(index: number, produto: Produto): number {
  return produto.id;
}
```

**Cuidados**: nunca usar `index` como chave se a lista pode ser reordenada/filtrada; usar sempre uma propriedade única e estável do domínio (ID, UUID).

#### 2.4 `OnPush` reduzindo ciclos desnecessários

Na estratégia `Default`, qualquer evento assíncrono monitorado pela Zone dispara verificação em **toda a árvore de componentes**. Com `OnPush`, o componente de lista só é reavaliado quando:

1. A referência do `@Input()` muda;
2. Um evento de DOM ocorre dentro do próprio template;
3. Um `Observable` via `async pipe` emite;
4. `markForCheck()`/`detectChanges()` é chamado manualmente.

Isso permite que o Angular **pule subárvores inteiras** quando componentes irmãos disparam CD por outros motivos.

#### Combinação `OnPush` + `trackBy` + imutabilidade

- **Imutabilidade** permite ao `OnPush` detectar mudanças com comparação O(1) por referência.
- **`OnPush`** reduz a *frequência* das checagens.
- **`trackBy`** reduz o *custo* de cada checagem, quando ela ocorre.

#### 2.4. Impacto de usar `Default`

| Cenário | Frequência de checagem da lista | Custo de cada atualização de dados |
|---|---|---|
| `Default` sem `trackBy` | A cada evento assíncrono de **toda a app** | Recria DOM de **todos** os itens |
| `Default` com `trackBy` | A cada evento assíncrono de **toda a app** | Atualiza apenas os itens que mudaram |
| `OnPush` sem `trackBy` | Apenas quando `@Input` muda de referência | Recria DOM de **todos** os itens |
| `OnPush` com `trackBy` | Apenas quando `@Input` muda de referência | Atualiza apenas os itens que mudaram |

A combinação `OnPush` + `trackBy` é o padrão recomendado para listas de tamanho não-trivial.

---

## 3.1 Angular Signals — estado local

### Pergunta

Criar um componente de contador de itens no carrinho usando exclusivamente Signals. O componente deve expor:

- Um signal para a lista de itens
- Um computed para o total (quantidade × preço)
- Um método para adicionar e remover itens
- Um `output()` que emite sempre que o total mudar

### Resposta: 
Link : do GitHub :https://github.com/Nambundo/contador_signais/tree/main
Link do deploy na vercel: https://contador-signais-rust.vercel.app/

## 3.2 Gerenciamento de Estado com NgRx (Feature To-do)

### Pergunta
Implementar a estrutura de estado para uma lista de tarefas (To-do) utilizando os padrões recomendados do NgRx, incluindo:

- **Actions**: `loadTodos`, `loadTodosSuccess`, `loadTodosError`, `toggleTodoComplete`.
- **Reducer**: estado inicial e transições com `createReducer`, tipagem forte.
- **Selectors**: `selectAllTodos` (lista completa) e `selectPendingTodos` (não concluídas) com `createSelector`.
- **Effect**: fluxo assíncrono — ao disparar `loadTodos`, chamada HTTP mockada e dispatch de sucesso/erro.

### Resposta
Link do GitHub: https://github.com/Nambundo/Respostas_desafio
Link do deploy na vercel: https://respostas-desafio-jpcz-ibno0mtal-nambundos-projects.vercel.app/

