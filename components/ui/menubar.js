'use client'

import *'react'
import *'@radix-ui/react-menubar'
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function Menubar({
 className,
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

function MenubarMenu({
 ...props
}: React.ComponentProps) {
 return 
}

function MenubarGroup({
 ...props
}: React.ComponentProps) {
 return 
}

function MenubarPortal({
 ...props
}: React.ComponentProps) {
 return 
}

function MenubarRadioGroup({
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

function MenubarTrigger({
 className,
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

function MenubarContent({
 className,
 align = 'start',
 alignOffset = -4,
 sideOffset = 8,
 ...props
}: React.ComponentProps) {
 return (

 </MenubarPortal>
 )
}

function MenubarItem({
 className,
 inset,
 variant = 'default',
 ...props
}: React.ComponentProps & {
 inset?}) {
 return (
 
 )
}

function MenubarCheckboxItem({
 className,
 children,
 checked,
 ...props
}: React.ComponentProps) {
 return (

 </MenubarPrimitive.ItemIndicator>
 </span>
 {children}
 </MenubarPrimitive.CheckboxItem>
 )
}

function MenubarRadioItem({
 className,
 children,
 ...props
}: React.ComponentProps) {
 return (

 </MenubarPrimitive.ItemIndicator>
 </span>
 {children}
 </MenubarPrimitive.RadioItem>
 )
}

function MenubarLabel({
 className,
 inset,
 ...props
}: React.ComponentProps & {
 inset?}) {
 return (
 
 )
}

function MenubarSeparator({
 className,
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

function MenubarShortcut({
 className,
 ...props
}: React.ComponentProps<'span'>) {
 return (
 
 )
}

function MenubarSub({
 ...props
}: React.ComponentProps) {
 return 
}

function MenubarSubTrigger({
 className,
 inset,
 children,
 ...props
}: React.ComponentProps & {
 inset?}) {
 return (
 
 {children}
 
 </MenubarPrimitive.SubTrigger>
 )
}

function MenubarSubContent({
 className,
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

export {
 Menubar,
 MenubarPortal,
 MenubarMenu,
 MenubarTrigger,
 MenubarContent,
 MenubarGroup,
 MenubarSeparator,
 MenubarLabel,
 MenubarItem,
 MenubarShortcut,
 MenubarCheckboxItem,
 MenubarRadioGroup,
 MenubarRadioItem,
 MenubarSub,
 MenubarSubTrigger,
 MenubarSubContent,
}
