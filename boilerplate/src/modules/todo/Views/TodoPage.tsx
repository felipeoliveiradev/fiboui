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
    signal
} from 'fiboui';
import { ValueBuilder } from '../../../../../src/core/builder';
import { TodoViewModel } from '../ViewModels/TodoViewModel';
import { InMemoryTodoRepository } from '../Services/InMemoryTodoRepository';
import { TodoItem } from './components/TodoItem';
import { navigate } from '../../../main/router';

let _vm: TodoViewModel | null = null;
function getViewModel() {
    if (!_vm) {
        _vm = new TodoViewModel(new InMemoryTodoRepository());
    }
    return _vm;
}

const inputText = signal('');

export const TodoPage = () => {
    const vm = getViewModel();

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
                                .onPress(() => navigate('performance'))
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
                                    Text(`${vm.vm.value.stats.active} items left`)
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
                        .children([
                            ValueBuilder(vm.vm)
                                .error((err: any) => Text(`Error: ${err} `).text(Colors.Error).build())
                                .children((state: any) => {
                                    return List()
                                        .className('flex-1 h-full')
                                        .items(state.visibleTodos)
                                        .loading(state.isLoading)
                                        .variant('default')
                                        .renderItem((todo) =>
                                            TodoItem({
                                                todo,
                                                onToggle: () => vm.toggleTodo(todo.id)
                                            })
                                        )
                                        .build()
                                })
                                .build()
                        ])
                        .build()
                ])
                .build()
        ])
        .build();
}

const FilterButton = (vm: TodoViewModel, filterKey: 'all' | 'active' | 'completed', label: string) => {
    const isActive = vm.vm.value.filter === filterKey;
    return Button()
        .text(label)
        .size('sm')
        .variant(isActive ? 'elevated' : 'text')
        .shape('pill')
        .onPress(() => vm.setFilter(filterKey))
        .build();
}
