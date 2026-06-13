'use client'

import *'react'
import *'@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function Dialog({
 ...props
}: React.ComponentProps) {
 return 
}

function DialogTrigger({
 ...props
}: React.ComponentProps) {
 return 
}

function DialogPortal({
 ...props
}: React.ComponentProps) {
 return 
}

function DialogClose({
 ...props
}: React.ComponentProps) {
 return 
}

function DialogOverlay({
 className,
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

function DialogContent({
 className,
 children,
 showCloseButton = true,
 ...props
}: React.ComponentProps & {
 showCloseButton?}) {
 return (

 {children}
 {showCloseButton && (

 Close</span>
 </DialogPrimitive.Close>
 )}
 </DialogPrimitive.Content>
 </DialogPortal>
 )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
 return (
 
 )
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
 return (
 
 )
}

function DialogTitle({
 className,
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

function DialogDescription({
 className,
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

export {
 Dialog,
 DialogClose,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogOverlay,
 DialogPortal,
 DialogTitle,
 DialogTrigger,
}
