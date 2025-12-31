import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

type ProgressVariant = 'default' | 'striped' | 'labeled' | 'circular' | 'segments' | 'knob' | 'steps' | 'chevron' | 'floating' | 'pagination' | 'timeline';

interface ProgressItem {
    title?: string;
    description?: string;
    date?: string;
}

const ProgressInner = React.memo((props: any) => {
    const { 
        value, max, color, height, variant = 'default', 
        label, subLabel, items = [],
        className, style, ...rest 
    } = props;

    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const mainColor = color || '#3B82F6';

    if (variant === 'circular') {
        const size = typeof height === 'number' ? height : 64; 
        const strokeWidth = 8;
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (percentage / 100) * circumference;

        return React.createElement('div', {
            className: `relative inline-flex items-center justify-center ${className}`,
            style: { width: size, height: size, ...style },
            ...rest
        }, [
            React.createElement('svg', {
                key: 'svg',
                className: 'transform -rotate-90',
                width: size,
                height: size
            }, [
                React.createElement('circle', {
                    key: 'track',
                    className: 'text-gray-100',
                    stroke: 'currentColor',
                    strokeWidth: strokeWidth,
                    fill: 'transparent',
                    r: radius,
                    cx: size / 2,
                    cy: size / 2
                }),
                React.createElement('circle', {
                    key: 'prog',
                    stroke: mainColor,
                    strokeWidth: strokeWidth,
                    strokeDasharray: circumference,
                    strokeDashoffset: offset,
                    strokeLinecap: 'round',
                    fill: 'transparent',
                    r: radius,
                    cx: size / 2,
                    cy: size / 2,
                    className: 'transition-all duration-1000 ease-out'
                })
            ]),
            React.createElement('span', {
                key: 'label',
                className: 'absolute text-sm font-bold text-gray-700'
            }, label || `${Math.round(percentage)}%`)
        ]);
    }

    if (variant === 'pagination') {
        const count = 5;
        const activeIndex = Math.floor((percentage / 100) * count); 
        
        return React.createElement('div', {
            className: `flex items-center gap-2 ${className}`,
            style,
            ...rest
        }, Array.from({ length: count }).map((_, i) => {
            const isActive = i === activeIndex;
            return React.createElement('div', {
                key: i,
                className: `h-3 rounded-full transition-all duration-300 ${isActive ? 'w-8' : 'w-3'}`,
                style: { backgroundColor: i <= activeIndex ? mainColor : '#E5E7EB' }
            });
        }));
    }

    if (variant === 'timeline') {
        const timelineItems = items.length ? items : [
            { title: 'Order components', date: 'Done' },
            { title: 'Draft implementation', date: 'In Progress' },
            { title: 'Verify functionality', date: 'Pending' }
        ];
        const activeIndex = Math.floor((percentage / 100) * timelineItems.length);

        return React.createElement('div', {
            className: `flex flex-col relative ${className}`,
            style,
            ...rest
        }, timelineItems.map((item: ProgressItem, i: number) => {
            const isCompleted = i < activeIndex;
            const isCurrent = i === activeIndex;
            const isLast = i === timelineItems.length - 1;
            
            const statusColor = isCompleted || isCurrent ? mainColor : '#E5E7EB';
            const iconContent = isCompleted ? React.createElement('span', {}, '✓') : (i + 1);

            return React.createElement('div', {
                key: i,
                className: `relative flex items-start gap-4 pb-8 last:pb-0`
            }, [
                !isLast && React.createElement('div', {
                    key: 'tail',
                    className: 'absolute left-[19px] top-10 bottom-0 w-0.5 transition-colors duration-500',
                    style: { backgroundColor: isCompleted ? mainColor : '#E5E7EB' }
                }),
                
                React.createElement('div', {
                    key: 'dot',
                    className: `relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white transition-all duration-300 shrink-0 text-sm font-bold shadow-sm`,
                    style: { 
                        borderColor: statusColor,
                        color: isCompleted ? '#fff' : (isCurrent ? statusColor : '#9CA3AF'),
                        backgroundColor: isCompleted ? statusColor : '#fff'
                    }
                }, iconContent),
                
                React.createElement('div', { key: 'content', className: 'pt-2' }, [
                    React.createElement('div', { className: 'text-sm font-bold text-gray-900 leading-none' }, item.title),
                    item.description && React.createElement('div', { className: 'text-xs text-gray-500 mt-1.5' }, item.description),
                    item.date && React.createElement('div', { className: 'text-xs font-mono text-gray-400 mt-1' }, item.date)
                ])
            ]);
        }));
    }

    if (variant === 'floating') {
        return React.createElement('div', {
            className: `w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 relative overflow-hidden ${className}`,
            style,
            ...rest
        }, [
            React.createElement('div', { key: 'info', className: 'flex justify-between items-center mb-3 px-1' }, [
                React.createElement('span', { key: 'l', className: 'text-sm font-semibold text-gray-700' }, 
                    label ? React.createElement('span', { className: 'text-blue-600 mr-2' }, `${Math.round(percentage)}%`) : null,
                    label || 'Update in progress...'
                ),
                subLabel && React.createElement('span', { key: 'r', className: 'text-xs font-medium text-gray-400' }, subLabel)
            ]),
            React.createElement('div', {
                key: 'track',
                className: 'w-full bg-blue-50 h-1.5 rounded-full overflow-hidden'
            }, React.createElement('div', {
                className: 'h-full rounded-full transition-all duration-1000 ease-out',
                style: { width: `${percentage}%`, backgroundColor: mainColor }
            }))
        ]);
    }

    if (variant === 'chevron') {
        const steps = 3; 
        const activeIndex = Math.floor((percentage / 100) * steps); 

        return React.createElement('div', {
            className: `flex w-full rounded-lg overflow-hidden ${className}`,
            style,
            ...rest
        }, Array.from({ length: steps }).map((_, i) => {
             const isActive = i <= activeIndex;
             
             return React.createElement('div', {
                 key: i,
                 className: `flex-1 h-10 flex items-center justify-center text-sm font-bold text-white transition-colors duration-300`,
                 style: { 
                     backgroundColor: isActive ? (i === activeIndex ? mainColor : '#60A5FA') : '#E5E7EB',
                     clipPath: i === 0 
                        ? 'polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)' 
                        : i === steps - 1
                            ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 15% 50%)'
                            : 'polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%, 15% 50%)',
                     marginLeft: i === 0 ? 0 : '-10px',
                     paddingLeft: i === 0 ? 0 : '10px',
                     zIndex: steps - i
                 }
             }, `Step ${i + 1}`);
        }));
    }

    if (variant === 'steps') {
        const steps = 3;
        const activeStep = Math.ceil((percentage / 100) * steps);

        return React.createElement('div', {
            className: `w-full flex items-center justify-between relative ${className}`,
            style: { 
                marginTop: '1rem', 
                ...style 
            },
            ...rest
        }, [
            React.createElement('div', {
                key: 'line-bg',
                className: 'absolute top-1/2 left-0 w-full h-1.5 bg-gray-200 z-0 transform -translate-y-1/2 rounded-full'
            }),
             React.createElement('div', {
                key: 'line-active',
                className: 'absolute top-1/2 left-0 h-1.5 z-0 transform -translate-y-1/2 transition-all duration-500 rounded-full',
                style: { width: `${percentage}%`, backgroundColor: mainColor }
            }),
            ...Array.from({ length: steps }).map((_, i) => {
                const stepNum = i + 1;
                const isActive = stepNum <= activeStep;
                const isCompleted = stepNum < activeStep;
                
                return React.createElement('div', {
                    key: i,
                    className: `relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-4 ${isActive ? 'text-white border-white shadow-md' : 'bg-gray-100 text-gray-400 border-gray-50'}`,
                    style: { backgroundColor: isActive ? mainColor : undefined }
                }, isCompleted ? React.createElement('span', {}, '✔') : stepNum);
            })
        ]);
    }

    const heightVal = height || ((variant === 'labeled' || variant === 'knob') ? 12 : 12);
    
    if (variant === 'segments') {
        const segCount = 10;
        const activeSegs = Math.round((percentage / 100) * segCount);
        
        return React.createElement('div', {
            className: `flex gap-1.5 w-full ${className}`,
            style,
            ...rest
        }, 
            Array.from({ length: segCount }).map((_, i) => React.createElement('div', {
                key: i,
                className: `h-3 flex-1 rounded-sm transition-all duration-300 first:rounded-l-full last:rounded-r-full`,
                style: { 
                    height: height || 12,
                    backgroundColor: i < activeSegs ? mainColor : '#E5E7EB' 
                }
            }))
        );
    }

    let innerContent: ReactElement | null = null;
    
    if (variant === 'striped') {
        innerContent = React.createElement('div', {
            className: 'w-full h-full opacity-30 animate-[stripes_1s_linear_infinite]', 
            style: {
                backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.25) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.25) 50%,rgba(255,255,255,.25) 75%,transparent 75%,transparent)',
                backgroundSize: '20px 20px'
            }
        });
    }

    const labelElement = variant === 'labeled' ? React.createElement('div', {
        className: 'absolute -top-12 transform -translate-x-1/2 bg-slate-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap',
        style: { left: `${percentage}%` }
    }, [
        label || `${Math.round(percentage)}%`,
        React.createElement('div', { key: 'arrow', className: 'absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45' })
    ]) : null;

    const knobElement = variant === 'knob' ? React.createElement('div', {
        className: 'absolute top-1/2 right-0 w-7 h-7 bg-white rounded-full shadow-lg border-4 transform translate-x-1/2 -translate-y-1/2 flex items-center justify-center',
        style: { borderColor: mainColor }
    }, React.createElement('div', { className: 'w-1.5 h-1.5 rounded-full', style: { backgroundColor: mainColor } })) : null;

    return React.createElement('div', {
        className: `relative w-full ${variant === 'labeled' ? 'mt-8' : ''}`, 
        ...rest
    }, [
        labelElement,
        React.createElement('div', {
            key: 'track',
            className: `w-full bg-slate-100 rounded-full ${className}`, 
            style: {
                width: '100%',
                height: heightVal,
                ...style
            }
        }, 
            React.createElement('div', {
                className: `h-full transition-all duration-1000 ease-out rounded-full flex items-center justify-center relative`,
                style: {
                    width: `${percentage}%`,
                    backgroundColor: mainColor
                }
            }, [innerContent, knobElement])
        )
    ]);
});

class ProgressBuilder extends FiboBuilder {
  private _value: number = 0;
  private _max: number = 100;
  private _color?: string;
  private _height?: number | string;
  private _variant: ProgressVariant = 'default';
  private _label?: string;
  private _subLabel?: string;
  private _items?: ProgressItem[];

  value(current: number): this {
    this._value = current;
    return this;
  }

  max(total: number): this {
    this._max = total;
    return this;
  }

  color(hex: string): this {
    this._color = hex;
    return this;
  }

  height(val: number | string): this {
    this._height = val;
    return this;
  }

  variant(val: ProgressVariant): this {
    this._variant = val;
    return this;
  }

  label(text: string): this {
    this._label = text;
    return this;
  }

  subLabel(text: string): this {
    this._subLabel = text;
    return this;
  }

  items(list: ProgressItem[]): this {
    this._items = list;
    return this;
  }

  build(): ReactElement {
    const props = {
        value: this._value,
        max: this._max,
        color: this._color,
        height: this._height,
        variant: this._variant,
        label: this._label,
        subLabel: this._subLabel,
        items: this._items,
        className: this.getClassName(),
        style: this.getStyle(),
        ...this._props
    };
    
    return React.createElement(ProgressInner, props);
  }
}


export const Progress = createBuilder(ProgressBuilder);

export interface ProgressProps extends BaseProps {
  value: number;
  max?: number;
  color?: string;
  variant?: ProgressVariant;
  label?: string;
  subLabel?: string;
  items?: ProgressItem[];
}
