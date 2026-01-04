import { Scaffold, ZStack, signal, Component, useStore, useNavigate, Button, Row, Text } from 'fiboui';
import { PerformanceViewModel } from '../ViewModels/PerformanceViewModel';
import { MapBackground } from './components/MapBackground';
import { FloatingHeader } from './components/FloatingHeader';
import { GoButton } from './components/GoButton';
import { BottomSheet } from './components/BottomSheet';
import { BottomNavBar } from './components/BottomNavBar';

const tripsCount = signal(0);

const PerformancePageComponent = () => {
  const vm = useStore(PerformanceViewModel);
  const navigate = useNavigate();
  const surfaceWhite = '#FFFFFF';

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

      BottomSheet({
        sheetY: vm.sheetY,
        earnings: vm.earnings
      })
    ])
    .footerBar({
      fixed: true,
      children: [BottomNavBar({})]
    })
    .build();
};

export const PerformancePage = Component()(PerformancePageComponent);
