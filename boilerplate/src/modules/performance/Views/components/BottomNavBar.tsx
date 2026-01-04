import { Button, Column, Row, Text, Icon, createFiboComponent } from 'fiboui';
import { Home, BarChart2, DollarSign, User } from 'lucide-react';

interface BottomNavBarProps { }

export const BottomNavBar = createFiboComponent<BottomNavBarProps>(() => {
  const uberBlack = '#1C1C1E';
  const textTertiary = '#9CA3AF';
  const surfaceWhite = '#FFFFFF';
  const borderLight = '#E5E7EB';

  return Row()
    .justifyContent('around')
    .paddingVertical(14)
    .paddingHorizontal(20)
    .bg(surfaceWhite)
    .style({
      boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
      borderTop: `1px solid ${borderLight}`
    })
    .children([
      Button()
        .clean()
        .children(
          Column()
            .alignItems('center')
            .gap(4)
            .paddingVertical(4)
            .children([
              Icon().source(Home).size(24).color(uberBlack).build(),
              Text('Home')
                .fontSize(11)
                .fontWeight('700')
                .color(uberBlack)
                .build()
            ])
            .build()
        )
        .build(),

      // Activity
      Button()
        .clean()
        .children(
          Column()
            .alignItems('center')
            .gap(4)
            .paddingVertical(4)
            .children([
              Icon().source(BarChart2).size(24).color(textTertiary).build(),
              Text('Activity')
                .fontSize(11)
                .fontWeight('500')
                .color(textTertiary)
                .build()
            ])
            .build()
        )
        .build(),

      // Earnings
      Button()
        .clean()
        .children(
          Column()
            .alignItems('center')
            .gap(4)
            .paddingVertical(4)
            .children([
              Icon().source(DollarSign).size(24).color(textTertiary).build(),
              Text('Earnings')
                .fontSize(11)
                .fontWeight('500')
                .color(textTertiary)
                .build()
            ])
            .build()
        )
        .build(),

      // Account
      Button()
        .clean()
        .children(
          Column()
            .alignItems('center')
            .gap(4)
            .paddingVertical(4)
            .children([
              Icon().source(User).size(24).color(textTertiary).build(),
              Text('Account')
                .fontSize(11)
                .fontWeight('500')
                .color(textTertiary)
                .build()
            ])
            .build()
        )
        .build()
    ])
    .build();
});
