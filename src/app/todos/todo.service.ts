import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Todo } from './todo.model';

@Injectable({ providedIn: 'root' })
export class TodoService {
  buscarTodos(): Observable<Todo[]> {
    return of([
      { id: 1, titulo: 'Estudar NgRx', concluida: false },
      { id: 2, titulo: 'Fazer atividade', concluida: true },
      { id: 3, titulo: 'Ler documentação', concluida: false },
      { id: 4, titulo: 'Enviar projeto', concluida: true },
      { id: 5, titulo: 'Revisar código', concluida: false },
    ]).pipe(delay(700));
  }
}
