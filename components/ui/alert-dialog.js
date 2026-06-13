'use client'

import *'react'
import *'@radix-ui/react-alert-dialog'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/ButtonClick'

function AlertDialog({
 ...props
}: React.ComponentProps) {
 return 
}

function AlertDialogTrigger({
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

function AlertDialogPortal({
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

function AlertDialogOverlay({
 className,
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

function AlertDialogContent({
 className,
 ...props
}: React.ComponentProps) {
 return (

 </AlertDialogPortal>
 )
}

function AlertDialogHeader({
 className,
 ...props
}: React.ComponentProps<'div'>) {
 return (
 
 )
}

function AlertDialogFooter({
 className,
 ...props
}: React.ComponentProps<'div'>) {
 return (
 
 )
}

function AlertDialogTitle({
 className,
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

function AlertDialogDescription({
 className,
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

function AlertDialogAction({
 className,
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

function AlertDialogCancel({
 className,
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

export {
 AlertDialog,
 AlertDialogPortal,
 AlertDialogOverlay,
 AlertDialogTrigger,
 AlertDialogContent,
 AlertDialogHeader,
 AlertDialogFooter,
 AlertDialogTitle,
 AlertDialogDescription,
 AlertDialogAction,
 AlertDialogCancel,
}
