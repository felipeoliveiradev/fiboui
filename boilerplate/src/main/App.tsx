import { ValueBuilder } from '../../../src/core/builder';
import { PerformancePage } from '../modules/performance/Views/PerformancePage';
import { TodoPage } from '../modules/todo/Views/TodoPage';
import { currentRoute } from './router';

export const App = () => {
    return ValueBuilder(currentRoute)
        .children((route) => {
            if (route === 'performance') return PerformancePage();
            return PerformancePage();
        })
        .build();
}
