import { TodoViewModel } from '../modules/todo/ViewModels/TodoViewModel';
import { InMemoryTodoRepository } from '../modules/todo/Services/InMemoryTodoRepository';

export class RootStore {
    readonly todoViewModel: TodoViewModel;
    constructor() {
        this.todoViewModel = new TodoViewModel(new InMemoryTodoRepository());
    }
}

export const rootStore = new RootStore();

