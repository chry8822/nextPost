// components/ConfirmDialog.tsx
import React from 'react';
import ModalWrapper from './ModalWrapper';

interface ConfirmDialogProps {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (result?: boolean) => void;
  onCancel: () => void;
  btnType: 'single' | 'double';
  open: boolean;
  position?: 'center' | 'default';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title = '확인',
  message,
  confirmText = '확인',
  cancelText = '취소',
  btnType = 'single',
  onConfirm,
  onCancel,
  position = 'default',
  open,
}) => {
  const getAlignmentClasses = () => {
    if (position === 'center') {
      return {
        title: 'text-center',
        message: 'text-center',
        buttons: 'justify-center',
      };
    }
    return {
      title: 'text-left',
      message: 'text-left',
      buttons: 'justify-end',
    };
  };

  const alignmentClasses = getAlignmentClasses();

  return (
    // 배경 오버레이
    <ModalWrapper open={open}>
      {(animatedOpen) => (
        <div
          className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/50 transition-opacity duration-300
        ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
        >
          <div
            className={`
          bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4
          transform transition-all duration-300
          ${open ? 'scale-100 translate-y-0' : 'scale-50 translate-y-0'}
        `}
          >
            {/* 제목 */}
            <h2 className={`text-xl font-bold mb-4 text-gray-800 ${alignmentClasses.title}`}>{title}</h2>

            {/* 메시지 */}
            <p className={`text-gray-600 mb-6 ${alignmentClasses.message}`}>{message}</p>

            {/* 버튼들 */}
            <div className={`flex space-x-3 ${alignmentClasses.buttons}`}>
              {btnType === 'double' ? (
                <>
                  <button onClick={() => onConfirm(true)} className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600">
                    {confirmText}
                  </button>
                  <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50">
                    {cancelText}
                  </button>
                </>
              ) : (
                <button onClick={() => onConfirm(true)} className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600">
                  {confirmText}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
};

export default ConfirmDialog;
