'use client';

import { CacheProvider } from '@emotion/react';
import { useServerInsertedHTML } from 'next/navigation';
import { ReactNode } from 'react';
import createCache from '@emotion/cache';

export function EmotionRootStyleRegistry({ children }: { children: ReactNode }) {
  const [registry] = useServerInsertedHTML(() => {
    const cache = createCache({ key: 'css' });
    cache.sheet.seal();
    return <style
      dangerouslySetInnerHTML={{
        __html: cache.sheet.tag.innerHTML,
      }}
      {...(cache.sheet.tags && {
        nonce: cache.sheet.nonce,
      })}
    />;
  }, []);

  const cache = createCache({ key: 'css' });

  return (
    <CacheProvider value={cache}>
      {children}
      {registry}
    </CacheProvider>
  );
}
