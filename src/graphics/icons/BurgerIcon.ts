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
        // 1. Shadow Base (Soft oval shadow under the burger)
        Circle()
          .center(50, 92)
          .radius(35)
          .fillHex('#000000')
          .opacity(0.15)
          .blur(4)
          .scale(1, 0.2)
          .build(),

        // 2. Bottom Bun (Heel)
        Path()
          // Custom shape for bottom bun with rounded bottom corners
          .startAt(15, 80)
          .pull(15, 92).to(30, 92) // Bends towards (15,92)
          .to(70, 92)              // Straight line
          .pull(85, 92).to(85, 80) // Bends towards (85,92)
          .to(85, 75)
          .to(15, 75)
          .done()
          .fillHex('#E6A15C') // Golden brown
          .strokeHex('#CC8E51') // Slightly darker border
          .strokeWidth(0.5)
          .shadow(0, 2, 3, 'rgba(0,0,0,0.1)')
          .build(),

        // Bottom Bun Highlight
        Path()
          .startAt(25, 88)
          .pull(50, 90).to(75, 88) // Bends towards (50,90)
          .strokeHex('#F5CBA7')
          .strokeWidth(2)
          .opacity(0.4)
          .fill('none')
          .build(),

        // 3. Meat Patty (Thick and textured)
        Rect()
          .position(12, 65)
          .size(76, 12)
          .cornerRadius(4)
          .fillHex('#5D4037') // Dark brown cooked meat
          .strokeHex('#3E2723')
          .strokeWidth(0.5)
          .children([
            // Grill marks / Texture
            Path().startAt(20, 65).to(20, 77).strokeHex('#3E2723').strokeWidth(1).opacity(0.3).build(),
            Path().startAt(35, 65).to(35, 77).strokeHex('#3E2723').strokeWidth(1).opacity(0.3).build(),
            Path().startAt(50, 65).to(50, 77).strokeHex('#3E2723').strokeWidth(1).opacity(0.3).build(),
            Path().startAt(65, 65).to(65, 77).strokeHex('#3E2723').strokeWidth(1).opacity(0.3).build(),
          ])
          .shadow(0, 2, 2, 'rgba(0,0,0,0.2)')
          .build(),

        // 4. Melted Cheese (Dripping over the patty)
        Path()
          // Shape traversing top of patty and dripping down
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
          .fillHex('#FFC107') // Amber/Gold cheese
          .strokeHex('#FFA000')
          .strokeWidth(0.5)
          .opacity(0.95)
          .shadow(0, 1, 1, 'rgba(0,0,0,0.1)')
          .build(),

        // 5. Tomato Slice (Shiny and Red)
        Rect()
          .position(14, 58)
          .size(72, 8)
          .cornerRadius(3)
          .fillHex('#F44336') // Vibrant red
          .strokeHex('#D32F2F')
          .strokeWidth(0.5)
          .children([
            // Glossy reflection
            Path()
              .startAt(18, 60)
              .to(84, 60)
              .strokeHex('#FFCDD2') // Pale pink/white highlight
              .strokeWidth(2)
              .opacity(0.6)
              .build()
          ])
          .build(),

        // 6. Lettuce (Ruffled edges)
        Path()
          // Wavy green layer
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
          .fillHex('#7CB342') // Fresh green
          .strokeHex('#558B2F')
          .strokeWidth(0.5)
          .shadow(0, 1, 2, 'rgba(0,0,0,0.15)')
          .build(),

        // 7. Top Bun (Crown) - Large dome
        Path()
          // Dome shape
          .startAt(10, 50)
          .pull(10, 20).to(50, 20)
          .pull(90, 20).to(90, 50)
          .to(90, 52)
          .pull(90, 55).to(85, 56)
          .to(15, 56)
          .pull(10, 55).to(10, 52)
          .done()
          .fillHex('#E6A15C') // Golden brown matches bottom
          .strokeHex('#CC8E51')
          .strokeWidth(0.5)
          .children([
            // Shine/Highlight on top
            Circle()
              .center(30, 35)
              .radius(10)
              .fillHex('#FFFFFF')
              .opacity(0.15)
              .blur(5)
              .scale(1.5, 0.8)
              .build()
          ])
          .shadow(0, -2, 4, 'rgba(0,0,0,0.05) inset') // Inner shadow for volume
          .build(),

        // 8. Sesame Seeds (Scattered on top)
        Circle().center(30, 32).radius(1.5).fillHex('#FFE0B2').build(),
        Circle().center(45, 28).radius(1.5).fillHex('#FFE0B2').build(),
        Circle().center(60, 30).radius(1.5).fillHex('#FFE0B2').build(),
        Circle().center(75, 35).radius(1.5).fillHex('#FFE0B2').build(),
        Circle().center(40, 42).radius(1.5).fillHex('#FFE0B2').build(),
        Circle().center(55, 40).radius(1.5).fillHex('#FFE0B2').build(),
        Circle().center(20, 40).radius(1.5).fillHex('#FFE0B2').build(),

        // Rotated seeds using Path for oval shape
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
