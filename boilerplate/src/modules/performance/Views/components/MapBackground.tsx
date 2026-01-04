import { Box, Signal, createFiboComponent } from 'fiboui';

interface MapBackgroundProps {
  isOnline: Signal<boolean>;
}

export const MapBackground = createFiboComponent<MapBackgroundProps>(({ isOnline }: MapBackgroundProps) => {
  const uberBlue = '#276EF1';

  return Box()
    .observer('map-bg')
    .width('100%')
    .height('100%')
    .children(() => [
      Box()
        .width('100%')
        .height('100%')
        .bg(isOnline.value ? '#E5E7EB' : '#D1D5DB')
        .className(`relative overflow-hidden transition-colors duration-1000 ${!isOnline.value ? 'grayscale' : ''}`)
        .children([
          // Grid pattern for "map" look
          Box()
            .width('100%')
            .height('100%')
            .className('opacity-20')
            .style({
              backgroundImage: 'radial-gradient(#9CA3AF 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            })
            .build(),

          // Simulated roads
          Box()
            .width('200%')
            .height(40)
            .bg('white')
            .className('absolute transform rotate-[-25deg] top-1/3 left-[-50%] border-y border-gray-300 shadow-sm opacity-60')
            .build(),

          Box()
            .width(40)
            .height('200%')
            .bg('white')
            .className('absolute transform rotate-[15deg] left-1/4 top-[-50%] border-x border-gray-300 shadow-sm opacity-60')
            .build(),

          // Current location pulse
          Box()
            .width(20)
            .height(20)
            .rounded('full')
            .bg(isOnline.value ? uberBlue : '#6B7280')
            .className(`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-white shadow-lg ${isOnline.value ? 'animate-pulse' : ''}`)
            .build()
        ])
        .build()
    ])
    .build();
});
