import { createAction, props } from '@ngrx/store';
import { Todo } from './todo.model';

export const loadTodos = createAction('[Todo] Load Todos');
export const loadTodosSuccess = createAction('[Todo] Load Todos Success', props<{ todos: Todo[] }>());
export const loadTodosError = createAction('[Todo] Load Todos Error', props<{ error: string }>());

export const toggleTodoComplete = createAction('[Todo] Toggle Todo Complete', props<{ id: number }>());
export const addTodo = createAction('[Todo] Add Todo', props<{ titulo: string }>());
export const updateTodo = createAction('[Todo] Update Todo', props<{ id: number; titulo: string }>());
export const deleteTodo = createAction('[Todo] Delete Todo', props<{ id: number }>());
