import { Box, Button, Column, Text, Signal, createFiboComponent } from 'fiboui';

interface GoButtonProps {
  isOnline: Signal<boolean>;
  sheetY: Signal<number>;
  onPress: () => void;
}

export const GoButton = createFiboComponent<GoButtonProps>(({ isOnline, sheetY, onPress }: GoButtonProps) => {
  const uberBlue = '#276EF1';
  const uberRed = '#E11900';

  return Box()
    .observer('go-button-wrapper')
    .children(() => [
      Column()
        .className('absolute left-0 w-full z-20 flex items-center justify-center pointer-events-none')
        .style({
          bottom: `${160 + Math.abs(sheetY.value)}px`,
          transition: 'bottom 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        })
        .children([
          Button()
            .clean()
            .className('pointer-events-auto')
            .onPress(onPress)
            .children(
              Box()
                .width(isOnline.value ? 76 : 84)
                .height(isOnline.value ? 76 : 84)
                .rounded('full')
                .bg(isOnline.value ? uberRed : uberBlue)
                .center()
                .className('transition-all duration-500 transform active:scale-90')
                .style({
                  boxShadow: isOnline.value
                    ? '0 8px 24px rgba(225, 25, 0, 0.4)'
                    : '0 8px 24px rgba(39, 110, 241, 0.4)',
                  border: '4px solid white',
                  zIndex: 30
                })
                .children(
                  Column()
                    .center()
                    .children([
                      Text(isOnline.value ? 'OFF' : 'GO')
                        .fontSize(isOnline.value ? 16 : 22)
                        .fontWeight('900')
                        .color('white')
                        .className('tracking-tighter')
                        .build()
                    ])
                    .build()
                )
                .build()
            )
            .build()
        ])
        .build()
    ])
    .build();
});
