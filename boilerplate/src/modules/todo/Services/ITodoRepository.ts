import { Todo } from '../Models/Todo';

export interface ITodoRepository {
    getAll(): Promise<Todo[]>;
    add(todo: Todo): Promise<void>;
    update(todo: Todo): Promise<void>;
    delete(id: string): Promise<void>;
}
