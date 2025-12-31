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
import { Avatar } from '../../../content/Avatar';
import { Icons } from '../../../core/icons';

const ProfileCardInner = React.memo((props: any) => {
    const { banner, avatar, name, handle, stats, className, style, ...rest } = props;

    return Card()
        .style({
          width: '100%',
          borderRadius: '24px',
          border: 'none',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)',
          padding: '0',
          overflow: 'hidden',
          background: '#fff',
          ...style
        })
        .className(className)
        .props(rest)
        .children([
            
            Box()
              .style({ height: '100px', backgroundImage: `url(${banner})`, backgroundSize: 'cover', backgroundPosition: 'center' })
              .build(),
              
            
            Column().padding(20).alignItems("center").style({ marginTop: '-50px' }).children([
                
                Avatar()
                   .image(avatar)
                   .size(80)
                   .border('4px solid #fff')
                   .build(),
                   
                Spacer().height(12).build(),
                
                
                Row().gap(6).alignItems("center").children([
                    Text(name).fontWeight(700).fontSize(18).color("#111827").build(),
                    Icons.Verify
                ]).build(),
                
                Text(handle).fontSize(13).color("#6B7280").style({ marginTop: '4px' }).build(),
                
                Spacer().height(16).build(),
                
                
                Button("+ Follow")
                   .variant("filled")
                   .shape("pill")
                   .shadow("soft")
                   .style({
                       backgroundColor: '#3B82F6',
                       color: '#fff',
                       padding: '8px 24px',
                       fontSize: '13px',
                       fontWeight: 600
                   })
                   .build(),
    
                Spacer().height(24).build(),
                
                
                Row().classNames(['w-full', 'border-t', 'border-gray-100', 'pt-4']).justifyContent("between").children([
                    Column().alignItems("center").gap(4).children([
                        Text(stats.items).fontWeight(700).fontSize(14).build(),
                        Text("Items").fontSize(11).color("#9CA3AF").build()
                    ]).build(),
                    Column().alignItems("center").gap(4).children([
                        Text(stats.owners).fontWeight(700).fontSize(14).build(),
                        Text("Owners").fontSize(11).color("#9CA3AF").build()
                    ]).build(),
                     Column().alignItems("center").gap(4).children([
                        Row().alignItems("center").gap(2).children([
                            Box().width(8).children(Icons.Eth).build(),
                            Text(stats.floor).fontWeight(700).fontSize(14).build(),
                        ]).build(),
                        Text("Floor").fontSize(11).color("#9CA3AF").build()
                    ]).build(),
                ]).build()
    
            ]).build()
        ]).build();
});

class ProfileCardBuilder extends FiboBuilder {
  private _banner: string = '';
  private _avatar: string = '';
  private _name: string = '';
  private _handle: string = '';
  private _stats: { items: string, owners: string, floor: string } = { items: '0', owners: '0', floor: '0' };

  banner(url: string): this {
    this._banner = url;
    return this;
  }

  avatar(url: string): this {
    this._avatar = url;
    return this;
  }

  name(text: string): this {
    this._name = text;
    return this;
  }

  handle(text: string): this {
    this._handle = text;
    return this;
  }

  stats(stats: { items: string, owners: string, floor: string }): this {
    this._stats = stats;
    return this;
  }

  build(): ReactElement {
    const props = {
        banner: this._banner,
        avatar: this._avatar,
        name: this._name,
        handle: this._handle,
        stats: this._stats,
        className: this.getClassName(),
        style: this.getStyle(),
        ...this._props
    };
    return React.createElement(ProfileCardInner, props);
  }
}


export const ProfileCard = createBuilder(ProfileCardBuilder);

export interface ProfileCardProps extends BaseProps {
  banner: string;
  avatar: string;
  name: string;
  handle: string;
  stats: { items: string, owners: string, floor: string };
}
