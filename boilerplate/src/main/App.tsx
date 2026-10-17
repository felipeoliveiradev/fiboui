import { Router } from 'fiboui';
import { Box, Text } from 'fiboui';
import { TodoPage } from '../modules/todo/Views/TodoPage';
import { PerformancePage } from '../modules/performance/Views/PerformancePage';

const NotFoundPage = () => {
    return Box()
        .width('100%')
        .height('100vh')
        .center()
        .children(
            Text('404 - Page Not Found')
                .fontSize(24)
        );
};

const routes = [
    {
        path: '/',
        component: TodoPage
    },
    {
        path: '/todo',
        component: TodoPage
    },
    {
        path: '/performance',
        component: PerformancePage
    }
];

export const App = () => {
    return (
        <Router
            routes={routes}
            fallback={NotFoundPage}
        />
    );
};
