'use client';

import React, { createContext, useContext, Suspense, useTransition } from 'react';
import { useRouter as useNextRouter, usePathname, useSearchParams } from 'next/navigation';
import NextLink from 'next/link';

const RouterContext = createContext(null);

function RouterProviderWrapper({ children }) {
  const nextRouter = useNextRouter();
  const pathname = usePathname() || '/';
  const navigate = (to) => {
    let target = to;
    if (!target.startsWith('/')) target = '/' + target;
    try {
      nextRouter.push(target);
    } catch {
      if (typeof window !== 'undefined') {
        window.location.href = target;
      }
    }
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  };

  const goBack = (fallback = '/') => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      nextRouter.back();
    } else {
      navigate(fallback);
    }
  };

  const matchRoute = (pattern) => {
    if (pattern === pathname) return { match: true, params: {} };
    if (!pattern.includes(':')) return { match: false, params: {} };

    const patternParts = pattern.split('/').filter(Boolean);
    const currentParts = pathname.split('/').filter(Boolean);

    if (patternParts.length !== currentParts.length) return { match: false, params: {} };

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        const paramName = patternParts[i].slice(1);
        params[paramName] = decodeURIComponent(currentParts[i]);
      } else if (patternParts[i] !== currentParts[i]) {
        return { match: false, params: {} };
      }
    }

    return { match: true, params };
  };

  const baseContext = {
    pathname,
    currentPath: pathname,
    searchParams: null,
    navigate,
    goBack,
    matchRoute
  };

  return (
    <Suspense fallback={
      <RouterContext.Provider value={baseContext}>
        <div className="min-h-screen bg-slate-50">{children}</div>
      </RouterContext.Provider>
    }>
      <SearchParamsConsumer baseContext={baseContext} pathname={pathname}>
        {children}
      </SearchParamsConsumer>
    </Suspense>
  );
}

function SearchParamsConsumer({ children, baseContext, pathname }) {
  const searchParams = useSearchParams();
  const queryString = searchParams?.toString();
  const currentPath = queryString ? `${pathname}?${queryString}` : pathname;

  const value = {
    ...baseContext,
    currentPath,
    searchParams
  };

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
}

export const RouterProvider = ({ children }) => {
  return <RouterProviderWrapper>{children}</RouterProviderWrapper>;
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    return {
      currentPath: '/',
      pathname: '/',
      searchParams: null,
      navigate: () => {},
      goBack: () => {},
      matchRoute: () => ({ match: false, params: {} })
    };
  }
  return context;
};

export const Link = ({ to, href, children, className = '', activeClassName = '', title = '', onClick, ...props }) => {
  const router = useRouter();
  const rawTarget = to || href || '/';
  const isObjectTarget = rawTarget && typeof rawTarget === 'object';
  const target = isObjectTarget
    ? `${rawTarget.pathname || '/'}${rawTarget.query ? '?' + new URLSearchParams(rawTarget.query).toString() : ''}`
    : (typeof rawTarget === 'string' ? rawTarget : String(rawTarget || '/'));

  // Kiểm tra nếu là URL bên ngoài (http, https, tel, mailto) hoặc liên kết neo (hash #)
  const isExternal = !isObjectTarget && (
    target.startsWith('http://') || 
    target.startsWith('https://') || 
    target.startsWith('tel:') || 
    target.startsWith('mailto:')
  );
  const isHash = !isObjectTarget && target.startsWith('#');

  const targetPath = (isExternal || isHash) ? target : (target.startsWith('/') ? target : '/' + target);
  const currentPath = router?.pathname || router?.currentPath || '/';

  const isActive = !isExternal && !isHash && (
    currentPath === targetPath || (targetPath !== '/' && currentPath.startsWith(targetPath))
  );
  const combinedClass = `${className} ${isActive ? activeClassName : ''}`.trim();

  const handleClick = (e) => {
    if (props.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) {
      if (onClick) onClick(e);
      return;
    }
    if (onClick) onClick(e);
  };

  if (isExternal) {
    const isTelOrMail = typeof target === 'string' && (target.startsWith('tel:') || target.startsWith('mailto:'));
    return (
      <a
        href={targetPath}
        onClick={handleClick}
        className={combinedClass}
        title={title}
        target={props.target || (isTelOrMail ? undefined : '_blank')}
        rel={props.rel || (isTelOrMail ? undefined : 'noopener noreferrer')}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <NextLink
      href={isObjectTarget ? rawTarget : targetPath}
      onClick={handleClick}
      className={combinedClass}
      title={title}
      prefetch={props.prefetch ?? true}
      {...props}
    >
      {children}
    </NextLink>
  );
};

export default RouterContext;
