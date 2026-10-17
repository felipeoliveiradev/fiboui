import { Box, Checkbox, Row } from 'fiboui';
import { Todo } from '../../Models/Todo';

interface TodoItemProps {
    todo: Todo;
    onToggle: () => void;
}

export function TodoItem({ todo, onToggle }: TodoItemProps) {
    return Box()
        .props({ key: todo.id })
        .bg('surface')
        .className('border')
        .borderColor('outline')
        .rounded(0.5)
        .p(1)
        .className('mb-2')
        .shadow('sm')
        .flex()
        .justifyContent('between')
        .alignItems('center')
        .children([
            Row()
                .gap(1)
                .alignItems("center")
                .children([
                    Checkbox()
                        .checked(todo.isCompleted)
                        .controlled(true)
                        .label(todo.text)
                        .onChange(onToggle)
                        .className(todo.isCompleted ? 'line-through opacity-60' : 'opacity-100'),
                ])
        ]);
}
