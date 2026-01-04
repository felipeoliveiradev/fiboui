import { Scaffold, ZStack, signal } from 'fiboui';
import { PerformanceViewModel } from '../ViewModels/PerformanceViewModel';
import { PerformanceService } from '../Services/PerformanceService';
import { MapBackground } from './components/MapBackground';
import { FloatingHeader } from './components/FloatingHeader';
import { GoButton } from './components/GoButton';
import { BottomSheet } from './components/BottomSheet';
import { BottomNavBar } from './components/BottomNavBar';

// Singleton ViewModel
let _vm: PerformanceViewModel | null = null;
function getViewModel() {
  if (!_vm) {
    _vm = new PerformanceViewModel(new PerformanceService());
  }
  return _vm;
}

// Additional signals
const tripsCount = signal(0);

export const PerformancePage = () => {
  const vm = getViewModel();
  const surfaceWhite = '#FFFFFF';

  const handleUpdate = () => {
    tripsCount.value += 1;
  };

  const handleToggle = () => {
    vm.toggleOnlineStatus();
    handleUpdate();
  };

  return Scaffold()
    .bg(surfaceWhite)
    .children([
      ZStack()
        .width('100%')
        .height('100%')
        .alignment('center')
        .children([
          MapBackground({ isOnline: vm.isOnline }),
          FloatingHeader({
            earnings: vm.earnings,
            tripsCount
          }),
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
        .build()
    ])
    .footerBar({
      fixed: true,
      children: [BottomNavBar({})]
    })
    .build();
};
