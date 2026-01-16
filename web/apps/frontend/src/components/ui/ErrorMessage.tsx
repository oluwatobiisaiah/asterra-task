import { AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export default function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  return (
    <div className={`bg-gradient-to-r from-danger-50 to-danger-100/50 border-2 border-danger-200 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="icon-wrapper icon-danger">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-danger-800">Error</p>
          <p className="text-sm text-danger-700">{message}</p>
        </div>
      </div>
    </div>
  );
}