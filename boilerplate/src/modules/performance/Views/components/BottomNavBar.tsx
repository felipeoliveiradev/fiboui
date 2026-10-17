import { Button, Column, Row, Text, Icon, useNavigate } from 'fiboui';
import { Home, BarChart2, DollarSign, User } from 'lucide-react';

export function BottomNavBar() {
  const navigate = useNavigate();
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
        .onPress(() => navigate('/todo'))
        .children(
          Column()
            .alignItems('center')
            .gap(4)
            .paddingVertical(4)
            .children([
              Icon().source(Home).size(24).color(uberBlack),
              Text('Home')
                .fontSize(11)
                .fontWeight('700')
                .color(uberBlack)
            ])
        ),

      Button()
        .clean()
        .children(
          Column()
            .alignItems('center')
            .gap(4)
            .paddingVertical(4)
            .children([
              Icon().source(BarChart2).size(24).color(textTertiary),
              Text('Activity')
                .fontSize(11)
                .fontWeight('500')
                .color(textTertiary)
            ])
        ),

      Button()
        .clean()
        .children(
          Column()
            .alignItems('center')
            .gap(4)
            .paddingVertical(4)
            .children([
              Icon().source(DollarSign).size(24).color(textTertiary),
              Text('Earnings')
                .fontSize(11)
                .fontWeight('500')
                .color(textTertiary)
            ])
        ),

      Button()
        .clean()
        .children(
          Column()
            .alignItems('center')
            .gap(4)
            .paddingVertical(4)
            .children([
              Icon().source(User).size(24).color(textTertiary),
              Text('Account')
                .fontSize(11)
                .fontWeight('500')
                .color(textTertiary)
            ])
        )
    ]);
}
