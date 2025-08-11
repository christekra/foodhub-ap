import * as React from "react"

export interface DropdownMenuProps {
  children: React.ReactNode
}

export interface DropdownMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

export interface DropdownMenuContentProps {
  children: React.ReactNode
  className?: string
}

export interface DropdownMenuItemProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  return <div className="relative">{children}</div>
}

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ children, asChild = false }) => {
  return <div className="cursor-pointer">{children}</div>
}

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ children, className = "" }) => {
  return (
    <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 py-1 z-50 ${className}`}>
      {children}
    </div>
  )
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ children, className = "", onClick }) => {
  return (
    <div 
      className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-700 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
