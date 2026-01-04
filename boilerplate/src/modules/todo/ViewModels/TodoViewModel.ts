import { createStore, computed, Store } from 'fiboui';
import { ITodoRepository } from '../Services/ITodoRepository';
import { Todo } from '../Models/Todo';

interface TodoState {
    todos: Todo[];
    filter: 'all' | 'active' | 'completed';
    isLoading: boolean;
    error: string | null;
}

export class TodoViewModel {
    private _store: Store<TodoState> = createStore<TodoState>({
        todos: [],
        filter: 'all',
        isLoading: false,
        error: null
    });

    constructor(private readonly repo: ITodoRepository) { }

    

    readonly vm = computed(() => {
        const { todos, filter, isLoading, error } = this._store.getState();

        let visibleTodos = todos;
        if (filter === 'completed') visibleTodos = todos.filter(t => t.isCompleted);
        else if (filter === 'active') visibleTodos = todos.filter(t => !t.isCompleted);

        return {
            visibleTodos,
            filter,
            isLoading,
            error,
            stats: {
                total: todos.length,
                completed: todos.filter(t => t.isCompleted).length,
                active: todos.filter(t => !t.isCompleted).length
            }
        };
    });

    

    async loadTodos() {
        this._store.setState({ isLoading: true, error: null });
        try {
            const data = await this.repo.getAll();
            this._store.setState({ todos: data, isLoading: false });
        } catch (e: any) {
            this._store.setState({ isLoading: false, error: e.message || 'Failed to load' });
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

        
        const previousState = this._store.getState().todos;
        this._store.setState(state => ({ todos: [...state.todos, newTodo] }));

        try {
            await this.repo.add(newTodo);
        } catch (e) {
            
            this._store.setState({ todos: previousState });
            alert('Failed to add todo');
        }
    }

    async toggleTodo(id: string) {
        const todo = this._store.getState().todos.find(t => t.id === id);
        if (!todo) return;

        const updated = { ...todo, isCompleted: !todo.isCompleted };

        this._store.setState(state => ({
            todos: state.todos.map(t => t.id === id ? updated : t)
        }));

        await this.repo.update(updated);
    }

    setFilter(filter: TodoState['filter']) {
        this._store.setState({ filter });
    }
}
