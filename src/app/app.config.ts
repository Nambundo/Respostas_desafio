import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { todoReducer } from './todos/todo.reducer';
import { TodoEffects } from './todos/todo.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideStore({ todos: todoReducer }),
    provideEffects([TodoEffects]),
    provideStoreDevtools({ maxAge: 25 }),
  ],
};
