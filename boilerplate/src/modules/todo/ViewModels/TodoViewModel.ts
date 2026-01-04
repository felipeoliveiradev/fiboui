import { Store, container, Signal, SignalType } from 'fiboui';
import { ITodoRepository } from '../Services/ITodoRepository';
import { InMemoryTodoRepository } from '../Services/InMemoryTodoRepository';
import { Todo } from '../Models/Todo';

@Store()
export class TodoViewModel {
    // Signal properties
    @Signal([])
    todos!: SignalType<Todo[]>;

    @Signal<'all' | 'active' | 'completed'>('all')
    filter!: SignalType<'all' | 'active' | 'completed'>;

    @Signal(false)
    isLoading!: SignalType<boolean>;

    @Signal<string | null>(null)
    error!: SignalType<string | null>;

    private repo: ITodoRepository;

    constructor() {
        this.repo = container.resolve(InMemoryTodoRepository);
    }

    // Computed properties
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

    // Actions
    async loadTodos() {
        this.isLoading.value = true;
        this.error.value = null;

        try {
            const data = await this.repo.getAll();
            this.todos.value = data;
            this.isLoading.value = false;
        } catch (e: any) {
            this.isLoading.value = false;
            this.error.value = e.message || 'Failed to load';
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

        // Optimistic update
        const previousTodos = this.todos.value;
        this.todos.value = [...this.todos.value, newTodo];

        try {
            await this.repo.add(newTodo);
        } catch (e) {
            // Rollback on error
            this.todos.value = previousTodos;
            alert('Failed to add todo');
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
