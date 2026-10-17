import { Store, signal } from 'fiboui';
import { ITodoRepository } from '../Services/ITodoRepository';
import { InMemoryTodoRepository } from '../Services/InMemoryTodoRepository';
import { Todo } from '../Models/Todo';

@Store()
export class TodoViewModel {
    todos = signal<Todo[]>([]);
    filter = signal<'all' | 'active' | 'completed'>('all');
    isLoading = signal(false);
    error = signal<string | null>(null);

    private repo: ITodoRepository;

    constructor() {
        this.repo = new InMemoryTodoRepository();
    }

    get visibleTodos(): Todo[] {
        const todos = this.todos.value;
        const filter = this.filter.value;

        if (filter === 'completed') return todos.filter(t => t.isCompleted);
        if (filter === 'active') return todos.filter(t => !t.isCompleted);
        return todos;
    }

    get stats() {
        const todos = this.todos.value;
        return {
            total: todos.length,
            completed: todos.filter(t => t.isCompleted).length,
            active: todos.filter(t => !t.isCompleted).length
        };
    }

    async loadTodos() {
        this.isLoading.value = true;
        this.error.value = null;

        try {
            const data = await this.repo.getAll();
            this.todos.value = data;
            this.isLoading.value = false;
        } catch (e: unknown) {
            this.isLoading.value = false;
            this.error.value = e instanceof Error ? e.message : 'Failed to load';
        }
    }

    async addTodo(text: string) {
        if (!text.trim()) return;

        const newTodo: Todo = {
            id: crypto.randomUUID(),
            text,
            isCompleted: false,
            createdAt: new Date()
        };

        const previousTodos = this.todos.value;
        this.todos.value = [...this.todos.value, newTodo];

        try {
            await this.repo.add(newTodo);
        } catch {
            this.todos.value = previousTodos;
        }
    }

    async toggleTodo(id: string) {
        const todo = this.todos.value.find(t => t.id === id);
        if (!todo) return;

        const updated = { ...todo, isCompleted: !todo.isCompleted };

        this.todos.value = this.todos.value.map(t =>
            t.id === id ? updated : t
        );

        await this.repo.update(updated);
    }

    setFilter(filter: 'all' | 'active' | 'completed') {
        this.filter.value = filter;
    }
}
