import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';

import { addTodo, deleteTodo, loadTodos, toggleTodoComplete, updateTodo } from './todo.actions';
import { selectAllTodos, selectError, selectLoading } from './todo.selectors';
import { Todo } from './todo.model';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="page">
      <section class="panel">
        <header class="header">
          <div class="brand">
            <div class="logo">☷</div>
            <div>
              <h1>Todo List</h1>
              <p>Gerenciamento de estado com NgRx</p>
            </div>
          </div>

          <button class="primary-button" type="button" (click)="abrirNovo()">
            <span>＋</span>
            Nova Tarefa
          </button>
        </header>

        <p class="loading" *ngIf="loading$ | async">Carregando tarefas...</p>
        <p class="error" *ngIf="error$ | async as error">{{ error }}</p>

        <section class="table-card">
          <div class="table-header">
            <span>Tarefa</span>
            <span>Status</span>
            <span>Ações</span>
          </div>

          <div class="row" *ngFor="let todo of todos$ | async; trackBy: trackById">
            <div class="task-cell">
              <button
                class="check"
                type="button"
                [class.checked]="todo.concluida"
                (click)="alternar(todo.id)"
              >
                <span *ngIf="todo.concluida">✓</span>
              </button>

              <span class="task-title">{{ todo.titulo }}</span>
            </div>

            <div>
              <span class="badge" [class.done]="todo.concluida" [class.pending]="!todo.concluida">
                <span class="dot"></span>
                {{ todo.concluida ? 'Concluída' : 'Pendente' }}
              </span>
            </div>

            <div class="actions">
              <button class="icon-button edit" type="button" (click)="abrirEdicao(todo)">
                ✎
              </button>

              <button class="icon-button remove" type="button" (click)="remover(todo.id)">
                🗑
              </button>
            </div>
          </div>
        </section>
      </section>

      <section class="modal-backdrop" *ngIf="modalAberto">
        <div class="modal">
          <h2>{{ editandoId ? 'Editar tarefa' : 'Nova tarefa' }}</h2>

          <label for="titulo">Título da tarefa</label>

          <input
            id="titulo"
            type="text"
            [(ngModel)]="tituloFormulario"
            placeholder="Ex: Estudar Angular"
            autofocus
          />

          <div class="modal-actions">
            <button class="secondary-button" type="button" (click)="fecharModal()">
              Cancelar
            </button>

            <button
              class="primary-button small"
              type="button"
              [disabled]="!tituloFormulario.trim()"
              (click)="salvar()"
            >
              Salvar
            </button>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(180deg, #f8f9fd 0%, #eef2f7 100%);
      color: #111827;
      font-family: Inter, Arial, Helvetica, sans-serif;
    }

    .page {
      width: 100%;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px 20px;
      box-sizing: border-box;
    }

    .panel {
      width: 100%;
      max-width: 900px;
      background: rgba(255, 255, 255, 0.96);
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
      padding: 40px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
      margin-bottom: 35px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .logo {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      color: white;
      font-size: 24px;
      font-weight: 800;
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      box-shadow: 0 10px 22px rgba(79, 70, 229, 0.25);
    }

    h1 {
      margin: 0;
      font-size: 2rem;
      line-height: 1.1;
      color: #0f172a;
    }

    .brand p {
      margin: 6px 0 0;
      font-size: 0.95rem;
      color: #64748b;
    }

    .primary-button {
      border: 0;
      border-radius: 8px;
      padding: 12px 20px;
      min-width: 150px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: #4f46e5;
      color: white;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 10px 22px rgba(79, 70, 229, 0.22);
      transition: 0.25s;
    }

    .primary-button:hover {
      background: #4338ca;
      transform: translateY(-2px);
    }

    .primary-button span {
      font-size: 1.3rem;
      line-height: 1;
    }

    .primary-button.small {
      min-width: 110px;
      padding: 12px 18px;
      font-size: 1rem;
    }

    .primary-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .table-card {
      overflow: hidden;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      background: white;
    }

    .table-header,
    .row {
      display: grid;
      grid-template-columns: 2fr 1fr 0.7fr;
      align-items: center;
      column-gap: 20px;
    }

    .table-header {
      padding: 18px 24px;
      background: #f8fafc;
      color: #475569;
      font-size: 0.95rem;
      font-weight: 800;
      border-bottom: 1px solid #e5e7eb;
    }

    .row {
      padding: 18px 24px;
      border-bottom: 1px solid #edf2f7;
    }

    .row:last-child {
      border-bottom: 0;
    }

    .task-cell {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .task-title {
      font-size: 1rem;
      color: #111827;
      font-weight: 500;
    }

    .check {
      width: 28px;
      height: 28px;
      border: 2px solid #aab1c2;
      border-radius: 6px;
      background: white;
      color: white;
      font-size: 18px;
      line-height: 1;
      font-weight: 900;
      cursor: pointer;
      display: grid;
      place-items: center;
    }

    .check.checked {
      border-color: #4f46e5;
      background: #4f46e5;
      box-shadow: 0 8px 18px rgba(79, 70, 229, 0.22);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 0.9rem;
      font-weight: 600;
      border: 1px solid transparent;
    }

    .dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      display: inline-block;
    }

    .badge.pending {
      color: #f59e0b;
      background: #fff7ed;
      border-color: #fed7aa;
    }

    .badge.pending .dot {
      background: #f59e0b;
    }

    .badge.done {
      color: #16a34a;
      background: #ecfdf3;
      border-color: #bbf7d0;
    }

    .badge.done .dot {
      background: #16a34a;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 18px;
      justify-content: flex-end;
    }

    .icon-button {
      border: 0;
      background: transparent;
      font-size: 1.3rem;
      cursor: pointer;
      line-height: 1;
      padding: 4px;
    }

    .edit {
      color: #4338ca;
    }

    .remove {
      color: #ef233c;
      font-size: 1.2rem;
    }

    .loading,
    .error {
      margin: -16px 0 20px;
      font-weight: 700;
    }

    .loading {
      color: #4338ca;
    }

    .error {
      color: #ef233c;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.32);
      display: grid;
      place-items: center;
      padding: 20px;
    }

    .modal {
      width: min(480px, 100%);
      background: white;
      border-radius: 14px;
      padding: 28px;
      box-shadow: 0 24px 80px rgba(15, 23, 42, 0.25);
    }

    .modal h2 {
      margin: 0 0 20px;
      color: #0f172a;
    }

    .modal label {
      display: block;
      margin-bottom: 8px;
      font-weight: 700;
      color: #374151;
    }

    .modal input {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 14px 16px;
      font-size: 1rem;
      outline: none;
    }

    .modal input:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
    }

    .modal-actions {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .secondary-button {
      border: 1px solid #d1d5db;
      background: white;
      color: #374151;
      border-radius: 8px;
      padding: 12px 18px;
      cursor: pointer;
      font-weight: 700;
    }

    @media (max-width: 900px) {
      .page {
        align-items: flex-start;
        padding-top: 30px;
      }

      .panel {
        max-width: 100%;
        padding: 25px;
      }

      .header {
        flex-direction: column;
        align-items: stretch;
      }

      .primary-button {
        width: 100%;
      }

      .table-header {
        display: none;
      }

      .row {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .actions {
        justify-content: flex-start;
      }
    }
  `],
})
export class TodoListComponent implements OnInit {
  readonly todos$ = this.store.select(selectAllTodos);
  readonly loading$ = this.store.select(selectLoading);
  readonly error$ = this.store.select(selectError);

  modalAberto = false;
  tituloFormulario = '';
  editandoId: number | null = null;

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(loadTodos());
  }

  alternar(id: number): void {
    this.store.dispatch(toggleTodoComplete({ id }));
  }

  abrirNovo(): void {
    this.editandoId = null;
    this.tituloFormulario = '';
    this.modalAberto = true;
  }

  abrirEdicao(todo: Todo): void {
    this.editandoId = todo.id;
    this.tituloFormulario = todo.titulo;
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.tituloFormulario = '';
    this.editandoId = null;
  }

  salvar(): void {
    const titulo = this.tituloFormulario.trim();

    if (!titulo) {
      return;
    }

    if (this.editandoId) {
      this.store.dispatch(updateTodo({ id: this.editandoId, titulo }));
    } else {
      this.store.dispatch(addTodo({ titulo }));
    }

    this.fecharModal();
  }

  remover(id: number): void {
    this.store.dispatch(deleteTodo({ id }));
  }

  trackById(_: number, todo: Todo): number {
    return todo.id;
  }
}