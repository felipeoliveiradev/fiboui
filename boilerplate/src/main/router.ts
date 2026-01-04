import { signal } from '../../../src/core/state';

export type Route = 'todo' | 'performance';

export const currentRoute = signal<Route>('todo');

export const navigate = (route: Route) => {
  currentRoute.value = route;
};
