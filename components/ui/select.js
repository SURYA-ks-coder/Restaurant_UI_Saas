'use client'

import *'react'
import *'@radix-ui/react-select'
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function Select({
 ...props
}: React.ComponentProps) {
 return 
}

function SelectGroup({
 ...props
}: React.ComponentProps) {
 return 
}

function SelectValue({
 ...props
}: React.ComponentProps) {
 return 
}

function SelectTrigger({
 className,
 size = 'default',
 children,
 ...props
}: React.ComponentProps & {
 size?: 'sm' | 'default'
}) {
 return (
 
 {children}

 </SelectPrimitive.Icon>
 </SelectPrimitive.Trigger>
 )
}

function SelectContent({
 className,
 children,
 position = 'popper',
 ...props
}: React.ComponentProps) {
 return (

 {children}
 </SelectPrimitive.Viewport>
 
 </SelectPrimitive.Content>
 </SelectPrimitive.Portal>
 )
}

function SelectLabel({
 className,
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

function SelectItem({
 className,
 children,
 ...props
}: React.ComponentProps) {
 return (

 </SelectPrimitive.ItemIndicator>
 </span>
 {children}</SelectPrimitive.ItemText>
 </SelectPrimitive.Item>
 )
}

function SelectSeparator({
 className,
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

function SelectScrollUpButton({
 className,
 ...props
}: React.ComponentProps) {
 return (

 </SelectPrimitive.ScrollUpButton>
 )
}

function SelectScrollDownButton({
 className,
 ...props
}: React.ComponentProps) {
 return (

 </SelectPrimitive.ScrollDownButton>
 )
}

export {
 Select,
 SelectContent,
 SelectGroup,
 SelectItem,
 SelectLabel,
 SelectScrollDownButton,
 SelectScrollUpButton,
 SelectSeparator,
 SelectTrigger,
 SelectValue,
}
