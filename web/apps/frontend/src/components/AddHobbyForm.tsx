import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heart, Users, Sparkles, ChevronDown} from 'lucide-react';
import { trpc } from '../lib/trpc';
import { createHobbySchema, type CreateHobbyFormData } from '../lib/validators';
import { useState, useEffect, useRef } from 'react';
import SuccessMessage from './ui/SuccessMessage';
import { Card, CardHeader, CardBody } from './ui/Card';
import { CardSkeleton } from './ui/SkeletonLoader';
import EmptyState from './table/EmptyState';

export default function AddHobbyForm() {
   const [showSuccess, setShowSuccess] = useState(false);
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');
   const dropdownRef = useRef<HTMLDivElement>(null);
   const utils = trpc.useUtils();

  const { data: users, isLoading: usersLoading } = trpc.user.getAll.useQuery();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateHobbyFormData>({
    resolver: zodResolver(createHobbySchema),
  });

  const createHobby = trpc.hobby.create.useMutation({
    onSuccess: () => {
      reset();
      setShowSuccess(true);
      utils.data.getUsersWithHobbies.invalidate();
    },
  });

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onSubmit = (data: CreateHobbyFormData) => {
    createHobby.mutate({
      userId: Number(data.userId),
      hobby: data.hobby,
    });
  };

  if (usersLoading) {
    return <CardSkeleton />;
  }

  if (!users || users.length === 0) {
    return (
      <EmptyState
        title="No Users Found"
        description="You need to create at least one user before you can add hobbies. Head over to the 'New User' tab to get started."
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="bg-black p-3 rounded-xl shadow-lg">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                <span className="hidden sm:inline">Add User Hobby</span>
                <span className="sm:hidden">Add Hobby</span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Assign a new hobby to an existing user
              </p>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          {showSuccess && (
            <SuccessMessage message="Hobby has been added successfully" className="mb-8" />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* User Selection */}
            <div className="group">
              <label htmlFor="userId" className="label">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  Select User
                </div>
              </label>
              <div className="relative" ref={dropdownRef}>
                <div
                  className={`input-base cursor-pointer flex items-center justify-between ${errors.userId ? 'input-error' : ''}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className={watch('userId') ? 'text-gray-900' : 'text-gray-400'}>
                    {watch('userId')
                      ? users?.find(u => u.id === Number(watch('userId')))?.firstName + ' ' + users?.find(u => u.id === Number(watch('userId')))?.lastName
                      : 'Search and select a user'
                    }
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="py-1">
                      {users
                        ?.filter(user =>
                          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((user) => (
                          <div
                            key={user.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => {
                              setValue('userId', user.id.toString());
                              setIsDropdownOpen(false);
                              setSearchTerm('');
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold text-xs">
                                {user.firstName[0]}{user.lastName[0]}
                              </div>
                              <span className="text-gray-900">{user.firstName} {user.lastName}</span>
                            </div>
                          </div>
                        ))}
                      {users?.filter(user =>
                        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
                      ).length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500">No users found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.userId && (
                <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full" />
                  {errors.userId.message}
                </p>
              )}
            </div>

            {/* Hobby Input */}
            <div className="group">
              <label htmlFor="hobby" className="label">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-slate-500" />
                  Hobby Name
                </div>
              </label>
              <input
                {...register('hobby')}
                type="text"
                id="hobby"
                className={`input-base ${errors.hobby ? 'input-error' : ''}`}
                placeholder="e.g., Photography, Gaming, Cooking, Traveling"
              />
              {errors.hobby && (
                <p className="mt-2 text-sm text-danger-600 font-medium flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 bg-danger-600 rounded-full" />
                  {errors.hobby.message}
                </p>
              )}
              <p className="mt-2 text-xs text-slate-500 font-medium">
                💡 Tip: Be specific! "Landscape Photography" is better than just "Photography"
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
              <button type="submit" disabled={createHobby.isPending} className="btn btn-primary flex-1">
                {createHobby.isPending ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    Adding Hobby...
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5" />
                    Add Hobby to User
                  </>
                )}
              </button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}