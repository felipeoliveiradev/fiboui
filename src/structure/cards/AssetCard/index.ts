import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../../core/builder';
import { BaseProps } from '../../../core/types';
import { Box } from '../../Box';
import { Text } from '../../../content/Text';
import { Row } from '../../../layout/Row';
import { Column } from '../../../layout/Column';
import { Spacer } from '../../../layout/Spacer';
import { Button } from '../../../interactive/Button';
import { Card } from '../../Card';
import { Badge } from '../../../content/Badge';
import { Icons } from '../../../core/icons';
import { Image } from '../../../content/Image';

const AssetCardInner = React.memo((props: any) => {
    const { image, title, price, likes, timeLeft, className, style, ...rest } = props;

    return Card()
      .classNames(['group', 'transition-all', 'duration-300', 'hover:-translate-y-1'])
      .style({
        width: '100%',
        borderRadius: '24px',
        border: 'none',
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)',
        padding: '16px',
        background: '#fff',
        ...style
      })
      .className(className)
      .props(rest)
      .children([

        Box().classNames(['relative', 'aspect-square', 'overflow-hidden', 'rounded-[20px]']).children([
           Image()
             .src(image)
             .alt(title || '')
             .classNames(['w-full', 'h-full', 'object-cover', 'bg-gray-200'])
             .build(),

           Box()
             .classNames(['absolute', 'top-3', 'right-3'])
             .children(
                Badge().variant("glass").shape("pill")
                .icon(Box().classNames(['text-gray-400', 'hover:text-red-500']).children(Icons.Heart).build())
                .text(`${likes}`)
                .build()
             ).build()
        ]).build(),

        Spacer().height(16).build(),

        Row().justifyContent("between").alignItems("start").children([
           Column().gap(4).children([
              Text(title).fontWeight(700).fontSize(18).color("#111827").build(),
              Badge().variant("neutral").text("Not for sale x1").build()
           ]).build(),
           Box().classNames(['text-gray-300']).children(Icons.More).build()
        ]).build(),

        Spacer().height(16).build(),

        Row().justifyContent("between").alignItems("center").children([
           Column().gap(4).children([
               Text("Current Bid").fontSize(11).fontWeight(600).color("#6B7280").build(),
               Row().gap(4).alignItems("center").children([
                   Box().classNames(['text-blue-500']).children(Icons.Eth).build(),
                   Text(`${price} ETH`).fontSize(15).fontWeight(700).color("#111827").build(),
               ]).build()
           ]).build(),

           Button("Place a bid")
             .variant("filled")
             .shape("pill")
             .shadow("soft")
             .style({
                backgroundColor: '#111827',
                color: '#fff',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 600
             })
             .build()
        ]).build(),

         Spacer().height(12).build(),

         timeLeft ?
           Badge()
             .variant("accent")
             .shape("rounded")
             .icon(Box().children(Icons.Clock).build())
             .text(timeLeft)
             .style({ width: '100%' })
             .build()
           : null

      ]).build();
});

class AssetCardBuilder extends FiboBuilder {
  private _image: string = '';
  private _title: string = '';
  private _price: string | number = '';
  private _likes: string | number = '';
  private _timeLeft?: string;

  image(url: string): this {
    this._image = url;
    return this;
  }

  title(text: string): this {
    this._title = text;
    return this;
  }

  price(value: string | number): this {
    this._price = value;
    return this;
  }

  likes(count: string | number): this {
    this._likes = count;
    return this;
  }

  timeLeft(time: string): this {
    this._timeLeft = time;
    return this;
  }

  build(): ReactElement {
    const props = {
        ...this._props,
        image: this._image,
        title: this._title,
        price: this._price,
        likes: this._likes,
        timeLeft: this._timeLeft,
        className: this.getClassName(),
        style: this.getStyle(),
    };
    return React.createElement(AssetCardInner, props);
  }
}

export const AssetCard = createBuilder(AssetCardBuilder);

export interface AssetCardProps extends BaseProps {
  image: string;
  title: string;
  price: string | number;
  likes: string | number;
  timeLeft?: string;
}
