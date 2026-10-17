import { Todo } from '../Models/Todo';
import { ITodoRepository } from './ITodoRepository';

export class InMemoryTodoRepository implements ITodoRepository {
    private _db: Todo[] = [
        { id: '1', text: 'Learn FiboUI Architecture', isCompleted: true, createdAt: new Date() },
        { id: '2', text: 'Build a Clean Architecture app', isCompleted: false, createdAt: new Date() },
        { id: '3', text: 'Master Reactivity', isCompleted: false, createdAt: new Date() }
    ];

    async getAll(): Promise<Todo[]> {
        return new Promise(resolve => setTimeout(() => resolve([...this._db]), 500));
    }

    async add(todo: Todo): Promise<void> {
        this._db.push(todo);
    }

    async update(todo: Todo): Promise<void> {
        this._db = this._db.map(t => t.id === todo.id ? todo : t);
    }

    async delete(id: string): Promise<void> {
        this._db = this._db.filter(t => t.id !== id);
    }
}
