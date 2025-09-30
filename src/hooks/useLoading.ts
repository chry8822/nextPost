import { useCallback } from 'react';
import { useLoadingStore } from '@/lib/stores/loading';

/**
 * 🎯 useLoading Hook - 로딩 상태 관리를 위한 커스텀 훅
 *
 * 사용법:
 * const { loading, startLoading, stopLoading, withLoading } = useLoading('dashboard');
 */
export function useLoading(identifier: string) {
  const { pageLoading, componentLoading, setPageLoading, setComponentLoading, isPageLoading, isComponentLoading } = useLoadingStore();

  // 현재 로딩 상태 확인
  const loading = pageLoading[identifier] || componentLoading[identifier] || false;

  // 로딩 시작
  const startLoading = useCallback(() => {
    // 페이지나 컴포넌트별 로딩
    if (identifier.includes('page') || identifier.includes('Page')) {
      setPageLoading(identifier, true);
    } else {
      setComponentLoading(identifier, true);
    }
  }, [identifier, setPageLoading, setComponentLoading]);

  // 로딩 중지
  const stopLoading = useCallback(() => {
    if (identifier.includes('page') || identifier.includes('Page')) {
      setPageLoading(identifier, false);
    } else {
      setComponentLoading(identifier, false);
    }
  }, [identifier, setPageLoading, setComponentLoading]);

  // 비동기 작업을 감싸서 자동으로 로딩 관리
  const withLoading = useCallback(
    async <T>(asyncFn: () => Promise<T>, errorMessage?: string): Promise<T | null> => {
      try {
        startLoading();
        const result = await asyncFn();
        return result;
      } catch (error) {
        console.error(`Loading error for ${identifier}:`, error);
        if (errorMessage) {
          throw new Error(errorMessage);
        }
        throw error;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading, identifier]
  );

  return {
    loading,
    startLoading,
    stopLoading,
    withLoading,
    // 유틸리티 함수들
    isPageLoading: useCallback((page: string) => isPageLoading(page), [isPageLoading]),
    isComponentLoading: useCallback((component: string) => isComponentLoading(component), [isComponentLoading]),
  };
}

/**
 * 📄 usePageLoading - 페이지 로딩 전용 훅
 */
export function usePageLoading(pageName: string) {
  return useLoading(`${pageName}Page`);
}

/**
 * 🧩 useComponentLoading - 컴포넌트 로딩 전용 훅
 */
export function useComponentLoading(componentName: string) {
  return useLoading(`${componentName}Component`);
}

/**
 * 🔄 useAsyncOperation - 비동기 작업 전용 훅
 *
 * 사용법:
 * const { execute } = useAsyncOperation('posts');
 * await execute(() => fetchData());
 */
export function useAsyncOperation(identifier: string) {
  const { withLoading } = useLoading(identifier);

  const execute = useCallback(
    async <T>(asyncFn: () => Promise<T>, errorMessage?: string): Promise<T | null> => {
      try {
        return await withLoading(asyncFn, errorMessage);
      } catch (error) {
        console.error(`Async operation error for ${identifier}:`, error);
        throw error;
      }
    },
    [withLoading, identifier]
  );

  return { execute };
}
