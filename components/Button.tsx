import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyle = "rounded-2xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center";
  
  const variants = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white border-b-4 border-blue-700",
    secondary: "bg-purple-400 hover:bg-purple-500 text-white border-b-4 border-purple-600",
    success: "bg-green-500 hover:bg-green-600 text-white border-b-4 border-green-700",
    danger: "bg-red-400 hover:bg-red-500 text-white border-b-4 border-red-600",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-xl",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {children}
    </button>
  );
};