'use client';

import { create } from 'zustand';

interface DialogBaseProps {
  onConfirm: (result?: any) => void;
  onCancel: () => void;
}

interface DialogItem {
  id: string;
  component: React.ComponentType<any>;
  props: any;
  open?: boolean;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

interface DialogState {
  dialogs: DialogItem[];
  openDialog: <TResult = any>(component: React.ComponentType<DialogBaseProps & any>, props?: Record<string, any>) => Promise<TResult>;
  closeDialog: (id: string) => void;
}

export const useDialogStore = create<DialogState>((set, get) => ({
  dialogs: [],

  openDialog: <TResult = any,>(component: React.ComponentType<DialogBaseProps & any>, props: Record<string, any> = {}): Promise<TResult> => {
    return new Promise<TResult>((resolve, reject) => {
      const id = `dialog-${Date.now()}-${Math.random()}`;

      set((state) => ({
        dialogs: [
          ...state.dialogs,
          {
            id,
            component,
            props: {
              ...props,
              onConfirm: (result?: TResult) => {
                resolve(result as TResult);
                get().closeDialog(id);
              },
              onCancel: () => {
                get().closeDialog(id);
                resolve(false as TResult);
              },
            },
            open: false,
            resolve,
            reject,
          },
        ],
      }));

      setTimeout(() => {
        set((state) => ({
          dialogs: state.dialogs.map((dialog) => (dialog.id === id ? { ...dialog, open: true } : dialog)),
        }));
      }, 10);
    });
  },

  closeDialog: (id: string) => {
    set((state) => ({
      dialogs: state.dialogs.map((dialog) => (dialog.id === id ? { ...dialog, open: false } : dialog)),
    }));

    // 트랜지션 시간 후 제거
    setTimeout(() => {
      set((state) => ({
        dialogs: state.dialogs.filter((dialog) => dialog.id !== id),
      }));
    }, 300);
  },
}));

export const useDialog = () => {
  const { openDialog } = useDialogStore();
  return { openDialog };
};

export const DialogContainer = () => {
  const dialogs = useDialogStore((state) => state.dialogs);

  return (
    <>
      {dialogs.map((dialog) => {
        const DialogComponent = dialog.component;
        return (
          <div key={dialog.id}>
            <DialogComponent {...dialog.props} open={dialog.open} />
          </div>
        );
      })}
    </>
  );
};
