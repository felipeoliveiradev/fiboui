import {
    Box,
    Scaffold,
    Text,
    Colors,
    Button,
    TextField,
    Row,
    Column,
    List,
    signal,
    Component,
    useStore,
    useNavigate
} from 'fiboui';
import { TodoViewModel } from '../ViewModels/TodoViewModel';
import { TodoItem } from './components/TodoItem';
import { useEffect } from 'react';

const inputText = signal('');

const TodoPageComponent = () => {
    const vm = useStore(TodoViewModel);
    const navigate = useNavigate();

    useEffect(() => {
        vm.loadTodos();
    }, []);

    const handleAdd = () => {
        if (inputText.value.trim()) {
            vm.addTodo(inputText.value);
            inputText.value = '';
        }
    };

    return Scaffold()
        .bg(Colors.Background)
        .headerBar(
            Box()
                .bg(Colors.Primary)
                .p(2)
                .shadow('md')
                .children([
                    Row()
                        .justifyContent('between')
                        .alignItems('center')
                        .children([
                            Text("FiboUI Todo")
                                .text(Colors.OnPrimary)
                                .fontSize(1.5)
                                .weight('bold')
                                .build(),
                            Button()
                                .text("Perf Test")
                                .variant("text")
                                .onPress(() => navigate('/performance'))
                                .className('text-white')
                                .build()
                        ])
                        .build()
                ])
                .build()
        )
        .children([
            Column()
                .p(2)
                .maxWidth(800)
                .mx('auto')
                .gap(2)
                .children([
                    Row()
                        .gap(1)
                        .children([
                            Box()
                                .className('flex-1')
                                .children([
                                    TextField()
                                        .value(inputText)
                                        .placeholder("What needs to be done?")
                                        .variant("outlined")
                                        .bg(Colors.Surface)
                                        .build()
                                ])
                                .build(),
                            Button()
                                .text("Add")
                                .variant("filled")
                                .onPress(handleAdd)
                                .height('full')
                                .build()
                        ])
                        .build(),

                    Box()
                        .observer()
                        .children(() => [
                            Row()
                                .justifyContent('between')
                                .alignItems('center')
                                .className("mb-4")
                                .children([
                                    Text(`${vm.stats.active} items left`)
                                        .text(Colors.Outline)
                                        .build(),

                                    Row()
                                        .gap(0.5)
                                        .bg(Colors.SurfaceVariant)
                                        .p(0.5)
                                        .rounded('full')
                                        .children([
                                            FilterButton(vm, 'all', 'All'),
                                            FilterButton(vm, 'active', 'Active'),
                                            FilterButton(vm, 'completed', 'Completed'),
                                        ])
                                        .build()
                                ])
                                .build()
                        ])
                        .build(),

                    Box()
                        .className('flex-1 overflow-y-auto')
                        .observer()
                        .children(() => {
                            if (vm.isLoading.value) {
                                return [Text('Loading...').build()];
                            }

                            if (vm.error.value) {
                                return [Text(`Error: ${vm.error.value}`).text(Colors.Error).build()];
                            }

                            return [
                                List()
                                    .className('flex-1 h-full')
                                    .items(vm.visibleTodos)
                                    .variant('default')
                                    .renderItem((todo) =>
                                        TodoItem({
                                            todo,
                                            onToggle: () => vm.toggleTodo(todo.id)
                                        })
                                    )
                                    .build()
                            ];
                        })
                        .build()
                ])
                .build()
        ])
        .build();
};

const FilterButton = (vm: TodoViewModel, filterKey: 'all' | 'active' | 'completed', label: string) => {
    const isActive = vm.filter.value === filterKey;
    return Button()
        .text(label)
        .size('sm')
        .variant(isActive ? 'elevated' : 'text')
        .shape('pill')
        .onPress(() => vm.setFilter(filterKey))
        .build();
};

export const TodoPage = Component()(TodoPageComponent);
