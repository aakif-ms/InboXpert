"use client";
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  IconBrandGithub,
  IconBrandGoogle,
} from "@tabler/icons-react";
import Link from "next/link";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export function AuthForm({ type = "login" }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const [formErrors, setFormErrors] = useState({});
  const { login, register, loading, error, clearError, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const isLogin = type === "login";
  const isSignup = type === "signup";

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    clearError();
    setFormErrors({});
  }, [type, clearError]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (isSignup) {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      if (!formData.firstName || !formData.lastName) {
        errors.name = 'First and last name are required';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      
      setFormData(prev => ({ ...prev, name: fullName }));
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      let result;
      
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        const fullName = `${formData.firstName} ${formData.lastName}`.trim();
        result = await register(fullName, formData.email, formData.password);
      }
      
      if (result.success) {
        router.push('/');
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    if (formErrors[id]) {
      setFormErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  };

  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
        {isLogin ? "Welcome back to InboXpert" : "Join InboXpert"}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
        {isLogin ? "Login to InboXpert" : "Create your account to get started"}
      </p>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form className="my-8" onSubmit={handleSubmit}>
        {isSignup && (
          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="firstName">First name</Label>
              <Input 
                id="firstName" 
                placeholder="Tyler" 
                type="text" 
                value={formData.firstName}
                onChange={handleInputChange}
                className={formErrors.name ? "border-red-500" : ""}
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="lastName">Last name</Label>
              <Input 
                id="lastName" 
                placeholder="Durden" 
                type="text" 
                value={formData.lastName}
                onChange={handleInputChange}
                className={formErrors.name ? "border-red-500" : ""}
              />
            </LabelInputContainer>
          </div>
        )}
        {formErrors.name && <p className="text-red-500 text-sm mb-4">{formErrors.name}</p>}
        
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            placeholder="projectmayhem@fc.com" 
            type="email" 
            value={formData.email}
            onChange={handleInputChange}
            className={formErrors.email ? "border-red-500" : ""}
          />
          {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
        </LabelInputContainer>
        
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            placeholder="••••••••" 
            type="password" 
            value={formData.password}
            onChange={handleInputChange}
            className={formErrors.password ? "border-red-500" : ""}
          />
          {formErrors.password && <p className="text-red-500 text-sm">{formErrors.password}</p>}
        </LabelInputContainer>
        
        {isSignup && (
          <LabelInputContainer className="mb-4">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input 
              id="confirmPassword" 
              placeholder="••••••••" 
              type="password" 
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={formErrors.confirmPassword ? "border-red-500" : ""}
            />
            {formErrors.confirmPassword && <p className="text-red-500 text-sm">{formErrors.confirmPassword}</p>}
          </LabelInputContainer>
        )}

        <button
          className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isLogin ? "Signing in..." : "Signing up..."}
            </span>
          ) : (
            <>{isLogin ? "Sign in" : "Sign up"} &rarr;</>
          )}
          <BottomGradient />
        </button>

        <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

        <div className="flex flex-col space-y-4">
          <button
            className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
            type="button"
            disabled={loading}
          >
            <IconBrandGithub className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              {isLogin ? "Sign in with GitHub" : "Sign up with GitHub"}
            </span>
            <BottomGradient />
          </button>
          <button
            className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
            type="button"
            disabled={loading}
          >
            <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              {isLogin ? "Sign in with Google" : "Sign up with Google"}
            </span>
            <BottomGradient />
          </button>
        </div>
      </form>
      
      <div className="text-center mt-6">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          {" "}
          <Link 
            href={isLogin ? "/signUp" : "/login"} 
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};