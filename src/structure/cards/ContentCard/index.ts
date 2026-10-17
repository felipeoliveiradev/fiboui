import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../../core/builder';
import { BaseProps } from '../../../core/types';
import { Card } from '../../Card';
import { Image } from '../../../content/Image';
import { Text } from '../../../content/Text';
import { Box } from '../../Box';

const ContentCardInner = React.memo((props: any) => {
    const {
        image,
        title,
        description,
        date,
        source,
        className,
        style,
        ...rest
    } = props;

    return Card()
        .className(`overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className || ''}`)
        .style(style)
        .props(rest)
        .children([

            image ? Image()
                .src(image)
                .alt(title || '')
                .className("w-full object-cover rounded-[20px] mb-4")
                .style({ height: '200px' })
                .build() : null,

            Box()
                .className("flex flex-col gap-2")
                .children([

                    title ? Text(title)
                        .fontSize(18)
                        .fontWeight(700)
                        .color("#111827")
                        .lineHeight(1.25)
                        .build() : null,

                    description ? Text(description)
                         .fontSize(14)
                         .color("#4B5563")
                         .lineHeight(1.5)
                         .className("line-clamp-2")
                         .build() : null,

                    (source || date) ? Box()
                        .className("flex items-center gap-2 mt-2")
                        .children([
                           Text(`${source ? source : ''}${source && date ? ' • ' : ''}${date ? date : ''}`)
                                .fontSize(11)
                                .fontWeight(600)
                                .color("#9CA3AF")
                                .textTransform("uppercase")
                                .letterSpacing("0.05em")
                                .build()
                        ])
                        .build() : null
                ])
                .build()
        ])
        .build();
});

class ContentCardBuilder extends FiboBuilder {
  private _image?: string;
  private _title?: string;
  private _description?: string;
  private _date?: string;
  private _source?: string;

  image(url: string): this {
    this._image = url;
    return this;
  }

  title(text: string): this {
    this._title = text;
    return this;
  }

  description(text: string): this {
    this._description = text;
    return this;
  }

  date(text: string): this {
    this._date = text;
    return this;
  }

  source(text: string): this {
    this._source = text;
    return this;
  }

  build(): ReactElement {
    const props = {
        ...this._props,
        image: this._image,
        title: this._title,
        description: this._description,
        date: this._date,
        source: this._source,
        className: this.getClassName(),
        style: this.getStyle(),
    };

    return React.createElement(ContentCardInner, props);
  }
}

export const ContentCard = createBuilder(ContentCardBuilder);

export interface ContentCardProps extends BaseProps {
  image?: string;
  title?: string;
  description?: string;
  date?: string;
  source?: string;
}
