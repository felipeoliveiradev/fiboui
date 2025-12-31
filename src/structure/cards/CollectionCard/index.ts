import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../../core/builder';
import { BaseProps } from '../../../core/types';
import { Box } from '../../Box';
import { Text } from '../../../content/Text';
import { Row } from '../../../layout/Row';
import { Column } from '../../../layout/Column';
import { Card } from '../../Card';
import { Icons } from '../../../core/icons';

const CollectionCardInner = React.memo((props: any) => {
    const { image, title, author, items, className, style, ...rest } = props;

    return Card()
        .classNames(['group', 'cursor-pointer'])
        .style({
           width: '100%',
           borderRadius: '24px',
           height: '320px',
           position: 'relative',
           overflow: 'hidden',
           border: 'none',
           ...style
        })
        .className(className)
        .props(rest)
        .children([
            
            Box().classNames(['absolute', 'inset-0', 'bg-cover', 'bg-center', 'transition-transform', 'duration-500'])
                 .style({ backgroundImage: `url(${image})` }).build(),
            
            
            Box().classNames(['absolute', 'inset-0', 'bg-gradient-to-t', 'from-black/80', 'via-black/20', 'to-transparent']).build(),
            
            
             Column().classNames(['absolute', 'bottom-0', 'left-0', 'p-6']).gap(4).children([
                Text(items).color("white").fontSize(12).classNames(['opacity-90', 'mb-1', 'uppercase', 'tracking-wider']).fontWeight(600).build(),
                Text(title).color("white").fontSize(22).fontWeight(700).build(),
                 Row().gap(6).alignItems("center").children([
                    Text("Created by").color("white").fontSize(13).classNames(['opacity-80']).build(),
                    Text(author).color("white").fontSize(13).fontWeight(600).build(),
                    Icons.Verify
                 ]).build()
            ]).build()
        ]).build();
});

class CollectionCardBuilder extends FiboBuilder {
  private _image: string = '';
  private _title: string = '';
  private _author: string = '';
  private _items: string = '';

  image(url: string): this {
    this._image = url;
    return this;
  }

  title(text: string): this {
    this._title = text;
    return this;
  }

  author(text: string): this {
    this._author = text;
    return this;
  }

  items(text: string): this {
    this._items = text;
    return this;
  }

  build(): ReactElement {
    const props = {
        image: this._image,
        title: this._title,
        author: this._author,
        items: this._items,
        className: this.getClassName(),
        style: this.getStyle(),
        ...this._props
    };
    return React.createElement(CollectionCardInner, props);
  }
}


export const CollectionCard = createBuilder(CollectionCardBuilder);

export interface CollectionCardProps extends BaseProps {
  image: string;
  title: string;
  author: string;
}
