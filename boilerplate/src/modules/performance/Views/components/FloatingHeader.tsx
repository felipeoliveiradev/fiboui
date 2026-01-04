import { Box, Button, Column, Row, Text, Icon, Signal, createFiboComponent, TextField, signal } from 'fiboui';
import { Menu, Bell, Search } from 'lucide-react';

interface FloatingHeaderProps {
  earnings: Signal<number>;
  tripsCount: Signal<number>;
}

const searchValue = signal('');

export const FloatingHeader = createFiboComponent<FloatingHeaderProps>(({ earnings, tripsCount }: FloatingHeaderProps) => {
  const uberBlack = '#1C1C1E';
  const uberBlue = '#276EF1';
  const textSecondary = '#6B7280';
  const textTertiary = '#9CA3AF';
  const borderLight = '#E5E7EB';

  return Column()
    .position('absolute')
    .top(0)
    .left(0)
    .width('100%')
    .zIndex(10)
    .paddingHorizontal(16)
    .paddingVertical(8)
    .children([
      // Top Bar
      Row()
        .observer('top-pill')
        .justifyContent('between')
        .alignItems('center')
        .children(() => [
          // Menu Button
          Button()
            .clean()
            .children(
              Box()
                .width(48)
                .height(48)
                .rounded('full')
                .bg('white')
                .center()
                .style({ boxShadow: '0 4px 12px rgba(0,0,0,0.12)' })
                .children(
                  Icon().source(Menu).size(24).color(uberBlack).build()
                )
                .build()
            )
            .build(),

          // Earnings Pill
          Box()
            .paddingVertical(10)
            .paddingHorizontal(20)
            .rounded('full')
            .bg('white')
            .style({ boxShadow: '0 4px 12px rgba(0,0,0,0.12)' })
            .children(
              Row()
                .gap(8)
                .alignItems('center')
                .children([
                  Text(`$${earnings.value.toFixed(2)}`)
                    .fontSize(16)
                    .fontWeight('700')
                    .color(uberBlack)
                    .className('transition-all duration-300')
                    .build(),
                  Box().width(1).height(16).bg(borderLight).build(),
                  Text(`${tripsCount.value} trips`)
                    .fontSize(14)
                    .fontWeight('500')
                    .color(textSecondary)
                    .build()
                ])
                .build()
            )
            .build(),

          // Notifications
          Button()
            .clean()
            .children(
              Box()
                .width(48)
                .height(48)
                .rounded('full')
                .bg('white')
                .center()
                .style({ boxShadow: '0 4px 12px rgba(0,0,0,0.12)' })
                .children(
                  Icon().source(Bell).size(24).color(uberBlack).build()
                )
                .build()
            )
            .build()
        ])
        .build(),

      // Quick Search Bar
      Box().height(12).build(),
      TextField()
        .value(searchValue)
        .placeholder('Where to?')
        .variant('outlined')
        .leadingIcon(Icon().source(Search).size(20).color(uberBlue).build())
        .className('!h-12')
        .style({
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          backgroundColor: 'white',
          border: 'none',
          borderRadius: '12px'
        })
        .build()
    ])
    .build();
});
