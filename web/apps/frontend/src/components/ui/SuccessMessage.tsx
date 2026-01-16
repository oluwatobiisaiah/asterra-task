import { CheckCircle2 } from 'lucide-react';

interface SuccessMessageProps {
  message: string;
  className?: string;
}

export default function SuccessMessage({ message, className = '' }: SuccessMessageProps) {
  return (
    <div className={`bg-gradient-to-r from-success-50 to-success-100/50 border-2 border-success-200 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="icon-wrapper icon-success">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-success-800">Success</p>
          <p className="text-sm text-success-700">{message}</p>
        </div>
      </div>
    </div>
  );
}