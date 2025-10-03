"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  IconBrandGithub,
  IconBrandGoogle,
} from "@tabler/icons-react";
import Link from "next/link";

export function AuthForm({ type = "login" }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const isLogin = type === "login";
  const isSignup = type === "signup";

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`${type} form submitted:`, formData);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSocialAuth = (provider) => {
    console.log(`${provider} authentication initiated`);
  };

  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
        {isLogin ? "Welcome back to InboXpert" : "Join InboXpert"}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
        {isLogin ? "Login to InboXpert" : "Create your account to get started"}
      </p>
      
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
              />
            </LabelInputContainer>
          </div>
        )}
        
        <LabelInputContainer className="mb-4">
          <Label htmlFor="username">Username</Label>
          <Input 
            id="username" 
            placeholder="tyler_durden" 
            type="text" 
            value={formData.username}
            onChange={handleInputChange}
          />
        </LabelInputContainer>
        
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            placeholder="projectmayhem@fc.com" 
            type="email" 
            value={formData.email}
            onChange={handleInputChange}
          />
        </LabelInputContainer>
        
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            placeholder="••••••••" 
            type="password" 
            value={formData.password}
            onChange={handleInputChange}
          />
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
            />
          </LabelInputContainer>
        )}

        <button
          className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
          type="submit"
        >
          {isLogin ? "Sign in" : "Sign up"} &rarr;
          <BottomGradient />
        </button>

        <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

        <div className="flex flex-col space-y-4">
          <button
            className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
            type="button"
            onClick={() => handleSocialAuth('github')}
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
            onClick={() => handleSocialAuth('google')}
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