'use client';

import React, { createContext, useContext, Suspense, useTransition } from 'react';
import { useRouter as useNextRouter, usePathname, useSearchParams } from 'next/navigation';
import NextLink from 'next/link';

const RouterContext = createContext(null);

function RouterProviderContent({ children }) {
  const nextRouter = useNextRouter();
  const pathname = usePathname() || '/';
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const queryString = searchParams?.toString();
  const currentPath = queryString ? `${pathname}?${queryString}` : pathname;

  const navigate = (to) => {
    let target = to;
    if (!target.startsWith('/')) target = '/' + target;
    startTransition(() => {
      nextRouter.push(target);
    });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <RouterContext.Provider value={{ currentPath, pathname, searchParams, navigate, goBack, matchRoute }}>
      {children}
    </RouterContext.Provider>
  );
}

export const RouterProvider = ({ children }) => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50">{children}</div>}>
      <RouterProviderContent>{children}</RouterProviderContent>
    </Suspense>
  );
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
  const target = to || href || '/';
  const targetPath = target.startsWith('/') ? target : '/' + target;
  const currentPath = router?.pathname || router?.currentPath || '/';

  const isActive = currentPath === targetPath || (targetPath !== '/' && currentPath.startsWith(targetPath));
  const combinedClass = `${className} ${isActive ? activeClassName : ''}`.trim();

  const handleClick = (e) => {
    if (props.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) {
      if (onClick) onClick(e);
      return;
    }
    if (onClick) onClick(e);
  };

  return (
    <NextLink
      href={targetPath}
      onClick={handleClick}
      className={combinedClass}
      title={title}
      {...props}
    >
      {children}
    </NextLink>
  );
};

export default RouterContext;
