import React, { MouseEvent, ReactNode } from 'react';
import { useRouterOptional } from './RouterContext';
import { joinBasename, stripBasename } from './Router';
import { matchPath } from './routeMatching';
import { isDangerousUrl, isNativeHref, mergeRel } from '../core/safeUrl';

/** Pathname only (`to` may carry ?query/#hash). */
function pathnameOf(to: string): string {
  const raw = typeof to === 'string' ? to.trim() : '';
  const path = raw.split(/[?#]/, 1)[0];
  if (!path || path === '/') return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

function searchAndHash(to: string): { search: string; hash: string } {
  const raw = typeof to === 'string' ? to.trim() : '';
  let rest = raw;
  let hash = '';
  const hashIdx = rest.indexOf('#');
  if (hashIdx >= 0) {
    hash = rest.slice(hashIdx);
    rest = rest.slice(0, hashIdx);
  }
  const qIdx = rest.indexOf('?');
  return { search: qIdx >= 0 ? rest.slice(qIdx) : '', hash };
}

/** Join basename once; `to` may already include it (same as navigate()). */
function inAppHref(basename: string, to: string): string {
  const { search, hash } = searchAndHash(to);
  const stripped = stripBasename(pathnameOf(to), basename);
  return `${joinBasename(basename, stripped)}${search}${hash}`;
}

function navLinkIsActive(
  currentPath: string,
  to: string,
  exact: boolean,
  basename = '',
): boolean {
  const target = stripBasename(pathnameOf(to), basename);
  const here = pathnameOf(currentPath);
  // Prefix `/` would mark every route active.
  if (target === '/') return here === '/';
  return matchPath(here, target, exact).match;
}

interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  children: ReactNode;
  replace?: boolean;
  state?: any;
}

export const Link: React.FC<LinkProps> = ({
  to,
  children,
  replace = false,
  state,
  className,
  style,
  onClick,
  target,
  download,
  rel,
  ...rest
}) => {
  const router = useRouterOptional();
  const dangerous = isDangerousUrl(to);
  const native = !dangerous && isNativeHref(to);
  const href = dangerous
    ? undefined
    : native
      ? to.trim()
      : inAppHref(router?.basename ?? '', to);
  const relValue =
    target && String(target).toLowerCase() === '_blank'
      ? mergeRel(rel, 'noopener noreferrer')
      : rel;

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (dangerous) {
      e.preventDefault();
      return;
    }
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (target && target !== '_self') return;
    if (download != null && download !== false) return;
    if (native) return;
    if (!router) return;

    e.preventDefault();
    router.navigate(to, { replace, state });
  };

  return (
    <a
      {...rest}
      href={href}
      onClick={handleClick}
      className={className}
      style={style}
      target={target}
      download={download}
      rel={relValue}
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
  const router = useRouterOptional();
  const isActive = !!router && navLinkIsActive(
    router.currentPath,
    to,
    exact,
    router.basename,
  );

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
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
};
