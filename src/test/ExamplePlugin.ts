import { FiboContext, FiboPlugin } from '../core/plugin/types';
import { Text } from '../content/Text';
import { Card } from '../structure/Card';
import { Row } from '../layout/Row';

// Example Service
// class NotificationService { ... }

// Example Overlay Component
const NotificationOverlay = () => {
  return Card()
    .className('fixed bottom-4 right-4 z-50 shadow-lg')
    .padding(16)
    .bg('white')
    .children(
      Row().children([
        Text('Plugin System Active!').weight('bold').color('green').build()
      ]).build()
    );
};

export const ExamplePlugin: FiboPlugin = {
  name: 'ExamplePlugin',
  version: '1.0.0',
  setup: (ctx: FiboContext) => {
    // 1. Register Service
    // ctx.registerService('NotificationService', new NotificationService());

    // 2. Register Sidebar Item
    ctx.registerSidebarItem({
      label: 'Plugin Demo',
      path: '/plugin-demo',
      order: 99
    });

    // 3. Register Overlay
    ctx.registerOverlay(() => NotificationOverlay());

    console.log('ExamplePlugin setup complete');
  }
};
