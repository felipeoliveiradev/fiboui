import { TodoViewModel } from '../modules/todo/ViewModels/TodoViewModel';

export class RootStore {
    readonly todoViewModel: TodoViewModel;
    constructor() {
        this.todoViewModel = new TodoViewModel();
    }
}

export const rootStore = new RootStore();
