'use client';

import { create } from 'zustand';

interface DialogBaseProps {
  dialogId?: string; // ID 추가
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

  openDialog: <TResult = any,>(component: React.ComponentType<DialogBaseProps & any>, props: Record<string, any> = {}): Promise<TResult> & { id: string } => {
    const id = `dialog-${Date.now()}-${Math.random()}`;

    const promise = new Promise<TResult>((resolve, reject) => {
      set((state) => ({
        dialogs: [
          ...state.dialogs,
          {
            id,
            component,
            props: {
              ...props,
              dialogId: id,
              children: typeof props.children === 'function' ? props.children(id) : props.children,
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
    }) as Promise<TResult> & { id: string };

    // Promise에 id 속성 추가
    (promise as any).id = id;
    return promise as Promise<TResult> & { id: string };
  },

  closeDialog: (id: string) => {
    set((state) => ({
      dialogs: state.dialogs.map((dialog) => (dialog.id === id ? { ...dialog, open: false } : dialog)),
    }));

    setTimeout(() => {
      set((state) => ({
        dialogs: state.dialogs.filter((dialog) => dialog.id !== id),
      }));
    }, 300);
  },
}));

export const useDialog = () => {
  const { openDialog, closeDialog } = useDialogStore();
  return { openDialog, closeDialog };
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
