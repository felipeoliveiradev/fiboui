import React, { MouseEvent, ReactNode } from 'react';
import { useNavigate } from './RouterContext';

interface LinkProps {
  to: string;
  children: ReactNode;
  replace?: boolean;
  state?: any;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export const Link: React.FC<LinkProps> = ({
  to,
  children,
  replace = false,
  state,
  className,
  style,
  onClick,
}) => {
  const navigate = useNavigate();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {

    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
      return;
    }

    e.preventDefault();

    if (onClick) {
      onClick(e);
    }

    navigate(to, { replace, state });
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      className={className}
      style={style}
    >
      {children}
    </a>
  );
};

interface NavLinkProps extends LinkProps {
  activeClassName?: string;
  activeStyle?: React.CSSProperties;
  exact?: boolean;
}

export const NavLink: React.FC<NavLinkProps> = ({
  to,
  children,
  className = '',
  style = {},
  activeClassName = 'active',
  activeStyle = {},
  exact = false,
  ...props
}) => {
  const currentPath = window.location.pathname;

  const isActive = exact
    ? currentPath === to
    : currentPath.startsWith(to);

  const finalClassName = isActive
    ? `${className} ${activeClassName}`.trim()
    : className;

  const finalStyle = isActive
    ? { ...style, ...activeStyle }
    : style;

  return (
    <Link
      to={to}
      className={finalClassName}
      style={finalStyle}
      {...props}
    >
      {children}
    </Link>
  );
};
