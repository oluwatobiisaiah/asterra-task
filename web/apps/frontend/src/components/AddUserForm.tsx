import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, User, MapPin, Phone } from 'lucide-react';
import { trpc } from '../lib/trpc';
import { createUserSchema, type CreateUserFormData } from '../lib/validators';
import { useState, useEffect } from 'react';
import SuccessMessage from './ui/SuccessMessage';
import { Card, CardHeader, CardBody } from './ui/Card';

export default function AddUserForm() {
  const [showSuccess, setShowSuccess] = useState(false);
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  });

  const createUser = trpc.user.create.useMutation({
    onSuccess: () => {
      reset();
      setShowSuccess(true);
      utils.user.getAll.invalidate();
      utils.data.getUsersWithHobbies.invalidate();
    },
  });

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const onSubmit = (data: CreateUserFormData) => {
    createUser.mutate(data);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="bg-black p-3 rounded-xl shadow-lg">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                <span className="hidden sm:inline">Add New User</span>
                <span className="sm:hidden">Add User</span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">Create a new user profile with their information</p>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          {showSuccess && (
            <SuccessMessage message="User created successfully!" className="mb-6" />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="group">
                <label htmlFor="firstName" className="label">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    First Name
                  </div>
                </label>
                <input
                  {...register('firstName')}
                  type="text"
                  id="firstName"
                  className={`input-base ${errors.firstName ? 'input-error' : ''}`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-2 text-sm text-danger-600 font-medium flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 bg-danger-600 rounded-full" />
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="group">
                <label htmlFor="lastName" className="label">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    Last Name
                  </div>
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  id="lastName"
                  className={`input-base ${errors.lastName ? 'input-error' : ''}`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-2 text-sm text-danger-600 font-medium flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 bg-danger-600 rounded-full" />
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="group">
              <label htmlFor="address" className="label">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  Address
                </div>
              </label>
              <textarea
                {...register('address')}
                id="address"
                rows={4}
                className={`input-base resize-none ${errors.address ? 'input-error' : ''}`}
                placeholder="123 Main Street, Apartment 4B, New York, NY 10001"
              />
              {errors.address && (
                <p className="mt-2 text-sm text-danger-600 font-medium flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 bg-danger-600 rounded-full" />
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="group">
              <label htmlFor="phone" className="label">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-500" />
                  Phone Number
                </div>
              </label>
              <input
                {...register('phone')}
                type="tel"
                id="phone"
                className={`input-base ${errors.phone ? 'input-error' : ''}`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="mt-2 text-sm text-danger-600 font-medium flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 bg-danger-600 rounded-full" />
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
              <button type="submit" disabled={createUser.isPending} className="btn btn-primary flex-1">
                {createUser.isPending ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    Creating User...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create User Profile
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
