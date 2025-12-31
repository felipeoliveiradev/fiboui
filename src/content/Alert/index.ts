import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps, StatusType } from '../../core/types';

import { Icons } from '../../core/icons';

const AlertInner = React.memo((props: any) => {
    const { title, description, intent = 'info', className, style, ...rest } = props;
    const currentIntent = intent as StatusType;

    
    const intentStyles: Record<StatusType, string> = {
        info: 'bg-blue-500 text-white',
        success: 'bg-emerald-500 text-white',
        warning: 'bg-orange-400 text-white', 
        error: 'bg-rose-500 text-white'
    };
    
    
    const iconBgStyles: Record<StatusType, string> = {
        info: 'bg-blue-600',
        success: 'bg-emerald-600',
        warning: 'bg-orange-500',
        error: 'bg-rose-600'
    };

    const iconMap: Record<StatusType, ReactElement> = {
        info: Icons.Info || React.createElement('span', {}, '?'),
        success: Icons.Check || React.createElement('span', {}, '✔'),
        warning: Icons.Search || React.createElement('span', {}, '!'), 
        error: Icons.Close || React.createElement('span', {}, 'x')
    };

    const baseClass = `relative overflow-hidden flex items-start gap-4 p-5 rounded-3xl shadow-lg border-none ${intentStyles[currentIntent]}`;

    return React.createElement('div', {
        className: `${baseClass} ${className}`,
        style,
        ...rest
    }, [
        
        React.createElement('div', { 
            key: 'blob1', 
            className: 'absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white opacity-10 pointer-events-none' 
        }),
        React.createElement('div', { 
            key: 'blob2', 
            className: 'absolute bottom-[-10px] left-10 w-12 h-12 rounded-full bg-black opacity-5 pointer-events-none' 
        }),
        React.createElement('div', { 
            key: 'blob3', 
            className: 'absolute top-10 right-20 w-8 h-8 rounded-full bg-white opacity-10 pointer-events-none' 
        }),

        
        React.createElement('div', { 
            key: 'icon-wrapper', 
            className: `relative z-10 shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${iconBgStyles[currentIntent]}` 
        }, React.cloneElement(iconMap[currentIntent] as ReactElement, { width: 20, height: 20, strokeWidth: 3 })),

        
        React.createElement('div', { key: 'content', className: 'relative z-10 flex flex-col gap-1.5 pt-0.5' }, [
            title && React.createElement('h5', { key: 'title', className: 'font-bold text-lg leading-none tracking-tight' }, title),
            description && React.createElement('p', { key: 'desc', className: 'text-sm font-medium opacity-90 leading-relaxed' }, description)
        ])
    ]);
});

class AlertBuilder extends FiboBuilder {
  private _title: string = '';
  private _description?: string;
  private _intent: StatusType = 'info';

  title(value: string): this {
    this._title = value;
    return this;
  }

  description(value: string): this {
    this._description = value;
    return this;
  }

  intent(value: StatusType): this {
    this._intent = value;
    return this;
  }

  build(): ReactElement {
    const props = {
        title: this._title,
        description: this._description,
        intent: this._intent,
        className: this.getClassName(),
        style: this.getStyle(),
        ...this._props
    };
    
    return React.createElement(AlertInner, props);
  }
}


export const Alert = createBuilder(AlertBuilder);

export interface AlertProps extends BaseProps {
  title: string;
  description?: string;
  intent?: StatusType;
}
