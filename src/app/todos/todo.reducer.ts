import { createReducer, on } from '@ngrx/store';
import {
  addTodo,
  deleteTodo,
  loadTodos,
  loadTodosError,
  loadTodosSuccess,
  toggleTodoComplete,
  updateTodo,
} from './todo.actions';
import { Todo } from './todo.model';

export interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
}

export const initialState: TodoState = {
  todos: [],
  loading: false,
  error: null,
};

export const todoReducer = createReducer(
  initialState,

  on(loadTodos, (state): TodoState => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(loadTodosSuccess, (state, { todos }): TodoState => ({
    ...state,
    todos,
    loading: false,
    error: null,
  })),

  on(loadTodosError, (state, { error }): TodoState => ({
    ...state,
    loading: false,
    error,
  })),

  on(toggleTodoComplete, (state, { id }): TodoState => ({
    ...state,
    todos: state.todos.map((todo) =>
      todo.id === id ? { ...todo, concluida: !todo.concluida } : todo
    ),
  })),

  on(addTodo, (state, { titulo }): TodoState => ({
    ...state,
    todos: [
      ...state.todos,
      {
        id: Date.now(),
        titulo,
        concluida: false,
      },
    ],
  })),

  on(updateTodo, (state, { id, titulo }): TodoState => ({
    ...state,
    todos: state.todos.map((todo) =>
      todo.id === id ? { ...todo, titulo } : todo
    ),
  })),

  on(deleteTodo, (state, { id }): TodoState => ({
    ...state,
    todos: state.todos.filter((todo) => todo.id !== id),
  }))
);
