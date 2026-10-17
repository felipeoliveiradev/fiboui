import {
    Box,
    Scaffold,
    Text,
    Button,
    TextField,
    Row,
    Column,
    List,
    Form,
    Component,
    useStore,
    useNavigate
} from 'fiboui';
import { TodoViewModel } from '../ViewModels/TodoViewModel';
import { TodoItem } from './components/TodoItem';
import { useEffect } from 'react';

const TodoPageComponent = () => {
    const vm = useStore(TodoViewModel);
    const navigate = useNavigate();

    useEffect(() => {
        vm.loadTodos();
    }, []);

    return Scaffold()
        .bg('background')
        .headerBar(
            Box()
                .bg('primary')
                .p(2)
                .shadow('md')
                .children([
                    Row()
                        .justifyContent('between')
                        .alignItems('center')
                        .children([
                            Text("FiboUI Todo")
                                .text('on-primary')
                                .fontSize(1.5)
                                .weight('bold'),
                            Button()
                                .text("Perf Test")
                                .variant("text")
                                .onPress(() => navigate('/performance'))
                                .className('text-white')
                        ])
                ])
        )
        .children([
            Column()
                .p(2)
                .maxWidth(800)
                .mx('auto')
                .gap(2)
                .children([
                    Form()
                        .onSubmit((values) => {
                            vm.addTodo(String(values.text ?? ''));
                        })
                        .afterSubmit((_values, form) => form.reset())
                        .children([
                            Row()
                                .gap(1)
                                .children([
                                    Box()
                                        .className('flex-1')
                                        .children([
                                            TextField()
                                                .name('text')
                                                .placeholder("What needs to be done?")
                                                .variant("outlined")
                                                .bg('surface')
                                        ]),
                                    Button()
                                        .text("Add")
                                        .variant("filled")
                                        .submit()
                                        .height('full')
                                ])
                        ]),

                    Box()
                        .observer()
                        .children(() => [
                            Row()
                                .justifyContent('between')
                                .alignItems('center')
                                .className("mb-4")
                                .children([
                                    Text(`${vm.stats.active} items left`)
                                        .text('outline'),

                                    Row()
                                        .gap(0.5)
                                        .bg('surface-variant')
                                        .p(0.5)
                                        .rounded('full')
                                        .children([
                                            FilterButton(vm, 'all', 'All'),
                                            FilterButton(vm, 'active', 'Active'),
                                            FilterButton(vm, 'completed', 'Completed'),
                                        ])
                                ])
                        ]),

                    Box()
                        .className('flex-1 overflow-y-auto')
                        .observer()
                        .children(() => {
                            if (vm.isLoading.value) {
                                return [Text('Loading...')];
                            }

                            if (vm.error.value) {
                                return [Text(`Error: ${vm.error.value}`).text('error')];
                            }

                            return [
                                List()
                                    .className('flex-1 h-full')
                                    .items(vm.visibleTodos)
                                    .variant('default')
                                    .empty(Text('No todos'))
                                    .renderItem((todo) =>
                                        TodoItem({
                                            todo,
                                            onToggle: () => vm.toggleTodo(todo.id)
                                        })
                                    )
                            ];
                        })
                ])
        ]);
};

const FilterButton = (vm: TodoViewModel, filterKey: 'all' | 'active' | 'completed', label: string) => {
    const isActive = vm.filter.value === filterKey;
    return Button()
        .text(label)
        .size('sm')
        .variant(isActive ? 'elevated' : 'text')
        .shape('pill')
        .onPress(() => vm.setFilter(filterKey));
};

export const TodoPage = Component()(TodoPageComponent);
