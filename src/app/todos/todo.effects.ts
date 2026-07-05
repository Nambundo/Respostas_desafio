import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { loadTodos, loadTodosError, loadTodosSuccess } from './todo.actions';
import { TodoService } from './todo.service';

@Injectable()
export class TodoEffects {
  loadTodos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTodos),
      switchMap(() =>
        this.todoService.buscarTodos().pipe(
          map((todos) => loadTodosSuccess({ todos })),
          catchError(() => of(loadTodosError({ error: 'Erro ao carregar tarefas.' })))
        )
      )
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly todoService: TodoService
  ) {}
}
