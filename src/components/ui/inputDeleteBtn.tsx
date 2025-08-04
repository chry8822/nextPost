import { CircleX } from 'lucide-react';

const InputDeleteBtn = ({ condition, reset }: { condition: boolean; reset: () => void }) => {
  return (
    condition && (
      <button className="absolute top-1/2 right-2 -translate-y-1/2" onClick={reset}>
        <CircleX color="#9e9e9e" size={20} strokeWidth={1.75} />
      </button>
    )
  );
};
InputDeleteBtn.displayName = 'InputDeleteBtn';

export { InputDeleteBtn };
