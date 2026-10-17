import { Scaffold, ZStack, signal, Component, useStore } from 'fiboui';
import { useEffect } from 'react';
import { PerformanceViewModel } from '../ViewModels/PerformanceViewModel';
import { MapBackground } from './components/MapBackground';
import { FloatingHeader } from './components/FloatingHeader';
import { GoButton } from './components/GoButton';
import { BottomSheet } from './components/BottomSheet';
import { BottomNavBar } from './components/BottomNavBar';

const tripsCount = signal(0);

const PerformancePageComponent = () => {
  const vm = useStore(PerformanceViewModel);

  useEffect(() => {
    return () => vm.dispose();
  }, [vm]);

  const handleUpdate = () => {
    tripsCount.value += 1;
  };

  const handleToggle = () => {
    vm.toggleOnlineStatus();
    handleUpdate();
  };

  return Scaffold()
    .headerBar({
      fixed: true,
      children: [
        FloatingHeader({
          earnings: vm.earnings,
          tripsCount
        }),
      ]
    })
    .children([
      ZStack()
        .width('100%')
        .height('100%')
        .className('relative')
        .children([
          MapBackground({ isOnline: vm.isOnline }),
          GoButton({
            isOnline: vm.isOnline,
            sheetY: vm.sheetY,
            onPress: handleToggle
          }),
          BottomSheet({
            sheetY: vm.sheetY,
            earnings: vm.earnings
          })
        ])
    ])
    .footerBar({
      fixed: true,
      children: [BottomNavBar()]
    });
};

export const PerformancePage = Component()(PerformancePageComponent);
