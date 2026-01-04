import { Box, Button, Column, Row, Text, Icon, Signal, DragGesture, createFiboComponent, ScrollView } from 'fiboui';
import { ShieldCheck, Zap, Navigation, ChevronUp } from 'lucide-react';

interface BottomSheetProps {
  sheetY: Signal<number>;
  earnings: Signal<number>;
}

export const BottomSheet = createFiboComponent<BottomSheetProps>(({ sheetY, earnings }: BottomSheetProps) => {
  const uberBlack = '#1C1C1E';
  const uberBlue = '#276EF1';
  const uberGreen = '#05A357';
  const textSecondary = '#6B7280';
  const textTertiary = '#9CA3AF';
  const borderLight = '#E5E7EB';
  const surfaceGray = '#F3F4F6';

  return Column()
    .className('absolute bottom-0 left-0 w-full z-10')
    .width('100%')
    .gesture(
      DragGesture()
        .onUpdate((e) => {
          const newY = sheetY.value + e.delta.y;
          sheetY.value = Math.max(-200, Math.min(0, newY));
        })
        .onEnd((e) => {
          const shouldExpand = e.velocity.y < -500 || sheetY.value < -100;
          const target = shouldExpand ? -250 : 0;
          sheetY.spring(target, { damping: 0.8, stiffness: 300 });
        })
    )
    .children([
      Box()
        .width('100%')
        .height(24)
        .bg('transparent')
        .center()
        .children(
          Box().width(36).height(5).rounded('full').bg('#D1D5DB').build()
        )
        .build(),
      Box()
        .observer('sheet-height')
        .width('100%')
        .children(() => [
          Box()
            .shadow('0 -8px 24px rgba(0,0,0,0.1)')
            .width('100%')
            .bg('white')
            .height(200 + Math.abs(sheetY.value))
            .borderTopLeftRadius('24px')
            .borderTopRightRadius('24px')
            .paddingBottom('20px')
            .overflow('hidden')
            .transition('height 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)')
            .children(
              Column()
                .paddingHorizontal(24)
                .paddingTop(12)
                .gap(16)
                .children([
                  Row()
                    .justifyContent('between')
                    .children([
                      Column()
                        .gap(4)
                        .children([
                          Text('Daily Overview')
                            .fontSize(14)
                            .fontWeight('600')
                            .color(textTertiary)
                            .build(),
                          Row()
                            .alignItems('center')
                            .gap(6)
                            .children([
                              Text('⭐ 4.98')
                                .fontSize(16)
                                .fontWeight('700')
                                .color(uberBlack)
                                .build(),
                              Text('Platinum')
                                .fontSize(12)
                                .fontWeight('600')
                                .color(uberGreen)
                                .className('bg-green-50 px-2 py-0.5 rounded')
                                .build()
                            ])
                            .build()
                        ])
                        .build(),

                      Button()
                        .clean()
                        .children(
                          Box()
                            .paddingHorizontal(16)
                            .paddingVertical(8)
                            .rounded('full')
                            .bg(surfaceGray)
                            .children(
                              Text('Profile')
                                .fontSize(14)
                                .fontWeight('600')
                                .color(uberBlack)
                                .build()
                            )
                            .build()
                        )
                        .build()
                    ])
                    .build(),

                  Box().height(1).bg(borderLight).build(),
                  Row()
                    .gap(12)
                    .alignItems('center')
                    .children([
                      Box()
                        .width(36)
                        .height(36)
                        .rounded('full')
                        .bg(uberBlue + '10')
                        .center()
                        .children(Icon().source(ShieldCheck).size(18).color(uberBlue).build())
                        .build(),
                      Text('You are in a safe area')
                        .fontSize(14)
                        .fontWeight('500')
                        .color(textSecondary)
                        .build(),
                      Box().className('flex-1').build(),
                      Icon().source(Zap).size(16).color('#F59E0B').build(),
                      Text('High Demand')
                        .fontSize(12)
                        .fontWeight('700')
                        .color('#F59E0B')
                        .build()
                    ])
                    .build(),

                  Box().height(1).bg(borderLight).build(),
                  Row()
                    .observer('last-trip')
                    .alignItems('center')
                    .gap(12)
                    .children(() => [
                      Box()
                        .width(44)
                        .height(44)
                        .bg(uberGreen + '10')
                        .center()
                        .children(Icon().source(Navigation).size(22).color(uberGreen).build())
                        .build(),
                      Column()
                        .flex(1)
                        .children([
                          Text(`Last Trip: $${(earnings.value * 0.3).toFixed(2)}`)
                            .fontSize(16)
                            .fontWeight('700')
                            .color(uberBlack)
                            .build(),
                          Text('28 min • Downtown to Airport')
                            .fontSize(13)
                            .color(textSecondary)
                            .build()
                        ])
                        .build(),
                      Icon().source(ChevronUp).size(20).color(textTertiary).build()
                    ])
                    .build(),
                  Box()
                    .width('100%')
                    .style({
                      opacity: Math.abs(sheetY.value) > 100 ? 1 : 0,
                      transition: 'opacity 0.3s ease-out'
                    })
                    .children(
                      Column()
                        .gap(16)
                        .children([
                          Box().height(1).bg(borderLight).build(),

                          Column()
                            .gap(8)
                            .children([
                              Text('Recent Trips')
                                .fontSize(14)
                                .fontWeight('600')
                                .color(textTertiary)
                                .build(),
                              Row()
                                .justifyContent('between')
                                .alignItems('center')
                                .children([
                                  ScrollView()
                                    .vertical()
                                    .children([
                                      Column()
                                        .gap(2)
                                        .children([
                                          Text('Downtown → Airport')
                                            .fontSize(14)
                                            .fontWeight('500')
                                            .color(uberBlack)
                                            .build(),
                                          Text('28 min • 15.2 mi')
                                            .fontSize(12)
                                            .color(textSecondary)
                                            .build()
                                        ])
                                        .build()
                                    ])
                                    .build(),
                                  Text('$42.50')
                                    .fontSize(16)
                                    .fontWeight('700')
                                    .color(uberGreen)
                                    .build()
                                ])
                                .build(),

                              Row()
                                .justifyContent('between')
                                .alignItems('center')
                                .children([
                                  Column()
                                    .gap(2)
                                    .children([
                                      Text('Marina → Financial District')
                                        .fontSize(14)
                                        .fontWeight('500')
                                        .color(uberBlack)
                                        .build(),
                                      Text('18 min • 8.4 mi')
                                        .fontSize(12)
                                        .color(textSecondary)
                                        .build()
                                    ])
                                    .build(),
                                  Text('$28.75')
                                    .fontSize(16)
                                    .fontWeight('700')
                                    .color(uberGreen)
                                    .build()
                                ])
                                .build(),

                              Row()
                                .justifyContent('between')
                                .alignItems('center')
                                .children([
                                  Column()
                                    .gap(2)
                                    .children([
                                      Text('Mission Bay → SoMa')
                                        .fontSize(14)
                                        .fontWeight('500')
                                        .color(uberBlack)
                                        .build(),
                                      Text('12 min • 4.1 mi')
                                        .fontSize(12)
                                        .color(textSecondary)
                                        .build()
                                    ])
                                    .build(),
                                  Text('$18.20')
                                    .fontSize(16)
                                    .fontWeight('700')
                                    .color(uberGreen)
                                    .build()
                                ])
                                .build()
                            ])
                            .build()
                        ])
                        .build()
                    )
                    .build()
                ])
                .build()
            )
            .build()
        ])
        .build()
    ])
    .build();
});
