import React from 'react';
import { Box } from '../structure/Box';
import { Button } from '../interactive/Button';

export const StakentCard = ({ className = "", style = {}, children }: any): any => {
    const box = Box()
        .className(`bg-[#0B0C15] border border-white/5 rounded-[32px] overflow-hidden relative ${className}`)
        .style({ backgroundColor: '#0B0C15', ...style });
    if (children != null && children !== '') {
        box.children(children);
    }
    return box;
};

export const StakentButton = ({ text, icon, variant = 'primary', className = "", onClick }: any): React.ReactElement => {
    let baseClass = "rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2";

    if (variant === 'primary') {
        baseClass += " bg-[#6366f1] text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] hover:-translate-y-0.5";
    } else if (variant === 'secondary') {
        baseClass += " bg-white/5 border border-white/10 text-white hover:bg-white/10";
    } else if (variant === 'outline') {
        baseClass += " border border-white/10 text-gray-400 hover:text-white hover:border-white/20";
    } else if (variant === 'ghost') {
        baseClass += " text-gray-400 hover:text-white hover:bg-white/5";
    } else if (variant === 'gradient') {
        baseClass += " bg-gradient-to-r from-[#818CF8] to-[#6366f1] text-white shadow-lg shadow-indigo-500/30 border-none";
    }

    return Button(text ?? '')
        .icon(icon)
        .className(`${baseClass} ${className}`)
        .onPress(onClick)
        .variant("text")
        .type('button')
        .build();
};

export const StakentSidebarItem = ({ label, icon, active = false }: any): React.ReactElement => {
    const current = active ? { 'aria-current': 'page' as const } : {};
    if (active) {
        return Button(label)
            .icon(icon ? Box().className(`${icon} w-5 h-5 text-white`).build() : null)
            .className("w-full justify-start text-sm font-bold text-white bg-[#6366f1] shadow-[0_4px_20px_rgba(99,102,241,0.4)] rounded-xl mb-1 py-3 px-4")
            .type('button')
            .props(current)
            .build();
    }
    return Button(label)
        .icon(icon ? Box().className(`${icon} w-5 h-5 text-gray-400 group-hover:text-white transition-colors`).build() : null)
        .variant("ghost")
        .className("w-full justify-start text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl group py-3 px-4")
        .type('button')
        .props(current)
        .build();
};

export const StakentBadge = ({ text, type = 'default' }: any): React.ReactElement => {
    let style = "text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider";
    if (type === 'hot') {
        style = "bg-[#FF3B30] text-white border-none text-[9px] px-1.5 py-0.5 rounded-md shadow-lg shadow-red-500/20";
    } else if (type === 'beta') {
         style = "bg-[#6366f1]/10 text-[#818CF8] border-[#6366f1]/20";
    } else if (type === 'new') {
        style = "bg-white text-black border-none";
    }
    return Box().className(style).children(text ?? '').build();
};
