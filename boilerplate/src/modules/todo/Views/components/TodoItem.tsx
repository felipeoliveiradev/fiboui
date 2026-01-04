import { Box, Text, Checkbox, Row, Colors, createFiboComponent } from 'fiboui';
import { Todo } from '../../Models/Todo';

interface TodoItemProps {
    todo: Todo;
    onToggle: () => void;
}

export const TodoItem = createFiboComponent<TodoItemProps>(({ todo, onToggle }: TodoItemProps) => {
    return Box()
        .props({ key: todo.id })
        .bg(Colors.Surface)
        .className('border')
        .borderColor(Colors.Outline)
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
                        .onChange(onToggle)
                        .build(),
                    Text(() => todo.text)
                        .className(todo.isCompleted ? "line-through opacity-60" : "opacity-100")
                        .fontSize(1)
                        .build()
                ]).build()
        ])
        .build();
}, (prev: TodoItemProps, next: TodoItemProps) => prev.todo === next.todo);
