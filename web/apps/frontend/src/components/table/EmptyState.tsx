import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
}

const EmptyState = React.memo<EmptyStateProps>(({ title, description, actionText }) => {
  return (
    <div className="card">
      <div className="card-body">
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl mb-6 shadow-inner">
            <Inbox className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-3">{title}</h3>
          <p className="text-slate-600 max-w-md mx-auto font-medium mb-8">
            {description}
          </p>
          {actionText && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold">
              <span className="inline-block w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              {actionText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;