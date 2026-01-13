import { ReactElement } from 'react';
import { Canvas } from '../Canvas';
import { Rect } from '../shapes/Rect';
import { Circle } from '../shapes/Circle';
import { Path } from '../shapes/Path';
import { FiboBuilder, createBuilder } from '../../core/builder';

class BurgerIconBuilder extends FiboBuilder {
  private _iconSize: number = 100;

  size(value: number): this {
    this._iconSize = value;
    return this;
  }

  build(): ReactElement {
    const s = this._iconSize;

    return Canvas()
      .width(s)
      .height(s)
      .viewBox('0 0 100 100')
      .children([

        Circle()
          .center(50, 92)
          .radius(35)
          .fillHex('#000000')
          .opacity(0.15)
          .blur(4)
          .scale(1, 0.2)
          .build(),

        Path()

          .startAt(15, 80)
          .pull(15, 92).to(30, 92)
          .to(70, 92)
          .pull(85, 92).to(85, 80)
          .to(85, 75)
          .to(15, 75)
          .done()
          .fillHex('#E6A15C')
          .strokeHex('#CC8E51')
          .strokeWidth(0.5)
          .shadow(0, 2, 3, 'rgba(0,0,0,0.1)')
          .build(),

        Path()
          .startAt(25, 88)
          .pull(50, 90).to(75, 88)
          .strokeHex('#F5CBA7')
          .strokeWidth(2)
          .opacity(0.4)
          .fill('none')
          .build(),

        Rect()
          .position(12, 65)
          .size(76, 12)
          .cornerRadius(4)
          .fillHex('#5D4037')
          .strokeHex('#3E2723')
          .strokeWidth(0.5)
          .children([

            Path().startAt(20, 65).to(20, 77).strokeHex('#3E2723').strokeWidth(1).opacity(0.3).build(),
            Path().startAt(35, 65).to(35, 77).strokeHex('#3E2723').strokeWidth(1).opacity(0.3).build(),
            Path().startAt(50, 65).to(50, 77).strokeHex('#3E2723').strokeWidth(1).opacity(0.3).build(),
            Path().startAt(65, 65).to(65, 77).strokeHex('#3E2723').strokeWidth(1).opacity(0.3).build(),
          ])
          .shadow(0, 2, 2, 'rgba(0,0,0,0.2)')
          .build(),

        Path()

          .startAt(12, 66)
          .to(88, 66)
          .to(88, 70)
          .pull(82, 70).to(78, 74)
          .pull(74, 78).to(70, 72)
          .pull(65, 70).to(60, 75)
          .pull(55, 80).to(50, 72)
          .pull(45, 70).to(40, 76)
          .pull(35, 82).to(30, 72)
          .pull(25, 70).to(20, 74)
          .to(12, 70)
          .done()
          .fillHex('#FFC107')
          .strokeHex('#FFA000')
          .strokeWidth(0.5)
          .opacity(0.95)
          .shadow(0, 1, 1, 'rgba(0,0,0,0.1)')
          .build(),

        Rect()
          .position(14, 58)
          .size(72, 8)
          .cornerRadius(3)
          .fillHex('#F44336')
          .strokeHex('#D32F2F')
          .strokeWidth(0.5)
          .children([

            Path()
              .startAt(18, 60)
              .to(84, 60)
              .strokeHex('#FFCDD2')
              .strokeWidth(2)
              .opacity(0.6)
              .build()
          ])
          .build(),

        Path()

          .startAt(10, 52)
          .pull(17.5, 58).to(25, 52)
          .pull(32.5, 58).to(40, 52)
          .pull(47.5, 58).to(55, 52)
          .pull(62.5, 58).to(70, 52)
          .pull(77.5, 58).to(85, 52)
          .pull(92, 55).to(90, 58)
          .to(12, 58)
          .pull(8, 55).to(10, 52)
          .done()
          .fillHex('#7CB342')
          .strokeHex('#558B2F')
          .strokeWidth(0.5)
          .shadow(0, 1, 2, 'rgba(0,0,0,0.15)')
          .build(),

        Path()

          .startAt(10, 50)
          .pull(10, 20).to(50, 20)
          .pull(90, 20).to(90, 50)
          .to(90, 52)
          .pull(90, 55).to(85, 56)
          .to(15, 56)
          .pull(10, 55).to(10, 52)
          .done()
          .fillHex('#E6A15C')
          .strokeHex('#CC8E51')
          .strokeWidth(0.5)
          .children([

            Circle()
              .center(30, 35)
              .radius(10)
              .fillHex('#FFFFFF')
              .opacity(0.15)
              .blur(5)
              .scale(1.5, 0.8)
              .build()
          ])
          .shadow(0, -2, 4, 'rgba(0,0,0,0.05) inset')
          .build(),

        Circle().center(30, 32).radius(1.5).fillHex('#FFE0B2').build(),
        Circle().center(45, 28).radius(1.5).fillHex('#FFE0B2').build(),
        Circle().center(60, 30).radius(1.5).fillHex('#FFE0B2').build(),
        Circle().center(75, 35).radius(1.5).fillHex('#FFE0B2').build(),
        Circle().center(40, 42).radius(1.5).fillHex('#FFE0B2').build(),
        Circle().center(55, 40).radius(1.5).fillHex('#FFE0B2').build(),
        Circle().center(20, 40).radius(1.5).fillHex('#FFE0B2').build(),

        Path()
          .startAt(68, 24)
          .pull(70, 24).to(70, 26)
          .pull(70, 28).to(68, 28)
          .pull(66, 28).to(66, 26)
          .pull(66, 24).to(68, 24)
          .done()
          .fillHex('#FFE0B2')
          .rotate(45, 68, 26)
          .build(),

        Path()
          .startAt(52, 22)
          .pull(54, 22).to(54, 24)
          .pull(54, 26).to(52, 26)
          .pull(50, 26).to(50, 24)
          .pull(50, 22).to(52, 22)
          .done()
          .fillHex('#FFE0B2')
          .rotate(-30, 52, 24)
          .build(),

      ])
      .build();
  }
}

export const BurgerIcon = createBuilder(BurgerIconBuilder);
