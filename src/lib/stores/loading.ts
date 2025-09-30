import { create } from 'zustand';

interface LoadingState {
  // 페이지별 로딩 상태
  pageLoading: Record<string, boolean>;

  // 컴포넌트별 로딩 상태
  componentLoading: Record<string, boolean>;

  // Actions
  setPageLoading: (page: string, loading: boolean) => void;
  setComponentLoading: (component: string, loading: boolean) => void;

  // 헬퍼 함수들
  isPageLoading: (page: string) => boolean;
  isComponentLoading: (component: string) => boolean;
  clearAllLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set, get) => ({
  // 초기 상태
  pageLoading: {},
  componentLoading: {},

  // 페이지별 로딩 설정
  setPageLoading: (page: string, loading: boolean) =>
    set((state) => ({
      pageLoading: {
        ...state.pageLoading,
        [page]: loading,
      },
    })),

  // 컴포넌트별 로딩 설정
  setComponentLoading: (component: string, loading: boolean) =>
    set((state) => ({
      componentLoading: {
        ...state.componentLoading,
        [component]: loading,
      },
    })),

  // 헬퍼 함수들
  isPageLoading: (page: string) => get().pageLoading[page] || false,
  isComponentLoading: (component: string) => get().componentLoading[component] || false,

  // 모든 로딩 상태 초기화
  clearAllLoading: () =>
    set({
      pageLoading: {},
      componentLoading: {},
    }),
}));
