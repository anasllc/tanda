import { create } from 'zustand';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface UIState {
  // Balance visibility
  isBalanceVisible: boolean;
  toggleBalanceVisibility: () => void;
  setBalanceVisibility: (visible: boolean) => void;

  // Loading states
  isLoading: boolean;
  loadingMessage: string | null;
  setLoading: (loading: boolean, message?: string | null) => void;

  // Toast notifications
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  clearToasts: () => void;

  // Modal states
  isPinModalVisible: boolean;
  pinModalCallback: ((success: boolean) => void) | null;
  showPinModal: (callback: (success: boolean) => void) => void;
  hidePinModal: () => void;

  // Bottom sheet states
  activeBottomSheet: string | null;
  bottomSheetData: any;
  openBottomSheet: (id: string, data?: any) => void;
  closeBottomSheet: () => void;

  // Keyboard state
  isKeyboardVisible: boolean;
  setKeyboardVisible: (visible: boolean) => void;

  // Network state
  isOnline: boolean;
  setOnline: (online: boolean) => void;
}

let toastIdCounter = 0;

export const useUIStore = create<UIState>((set, get) => ({
  // Balance visibility
  isBalanceVisible: true,
  toggleBalanceVisibility: () => set((state) => ({
    isBalanceVisible: !state.isBalanceVisible,
  })),
  setBalanceVisibility: (visible) => set({ isBalanceVisible: visible }),

  // Loading states
  isLoading: false,
  loadingMessage: null,
  setLoading: (loading, message = null) => set({
    isLoading: loading,
    loadingMessage: message,
  }),

  // Toast notifications
  toasts: [],
  showToast: (toast) => {
    const id = `toast_${++toastIdCounter}`;
    const newToast: Toast = { ...toast, id };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-dismiss after duration
    const duration = toast.duration ?? 3000;
    if (duration > 0) {
      setTimeout(() => {
        get().hideToast(id);
      }, duration);
    }
  },
  hideToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),
  clearToasts: () => set({ toasts: [] }),

  // Modal states
  isPinModalVisible: false,
  pinModalCallback: null,
  showPinModal: (callback) => set({
    isPinModalVisible: true,
    pinModalCallback: callback,
  }),
  hidePinModal: () => set({
    isPinModalVisible: false,
    pinModalCallback: null,
  }),

  // Bottom sheet states
  activeBottomSheet: null,
  bottomSheetData: null,
  openBottomSheet: (id, data = null) => set({
    activeBottomSheet: id,
    bottomSheetData: data,
  }),
  closeBottomSheet: () => set({
    activeBottomSheet: null,
    bottomSheetData: null,
  }),

  // Keyboard state
  isKeyboardVisible: false,
  setKeyboardVisible: (visible) => set({ isKeyboardVisible: visible }),

  // Network state
  isOnline: true,
  setOnline: (online) => set({ isOnline: online }),
}));

// Selectors
export const selectIsBalanceVisible = (state: UIState) => state.isBalanceVisible;
export const selectIsLoading = (state: UIState) => state.isLoading;
export const selectToasts = (state: UIState) => state.toasts;
export const selectIsPinModalVisible = (state: UIState) => state.isPinModalVisible;
