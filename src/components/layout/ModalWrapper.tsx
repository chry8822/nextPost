import React, { useEffect, useState } from 'react';

interface ModalWrapperProps {
  open: boolean;
  onExited?: () => void; // 트랜지션 종료 후 콜백 (예: 완전 언마운트 시)
  children: (open: boolean) => React.ReactNode;
  duration?: number; // 트랜지션 시간(ms)
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({ open: externalOpen, onExited, children, duration = 300 }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    if (externalOpen) {
      // 마운트 후 등장 트랜지션 트리거
      timeout = setTimeout(() => setOpen(true), 10);
    } else {
      setOpen(false);
      // 퇴장 트랜지션 후 콜백
      if (onExited) {
        timeout = setTimeout(() => onExited(), duration);
      }
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [externalOpen, onExited, duration]);

  return <>{children(open)}</>;
};

export default ModalWrapper;
