'use client'

import *'react'
import { Command} from 'cmdk'
import { SearchIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
} from '@/components/ui/dialog'

function Command({
 className,
 ...props
}) {
 return (
 
 )
}

function CommandDialog({
 title = 'Command Palette',
 description = 'Search for a command to run...',
 children,
 className,
 showCloseButton = true,
 ...props
} & {
 title?}) {
 return (

 {title}</DialogTitle>
 {description}</DialogDescription>
 </DialogHeader>

 {children}
 </Command>
 </DialogContent>
 </Dialog>
 )
}

function CommandInput({
 className,
 ...props
}: React.ComponentProps) {
 return (

 </div>
 )
}

function CommandList({
 className,
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

function CommandEmpty({
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

function CommandGroup({
 className,
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

function CommandSeparator({
 className,
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

function CommandItem({
 className,
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

function CommandShortcut({
 className,
 ...props
}: React.ComponentProps<'span'>) {
 return (
 
 )
}

export {
 Command,
 CommandDialog,
 CommandInput,
 CommandList,
 CommandEmpty,
 CommandGroup,
 CommandItem,
 CommandShortcut,
 CommandSeparator,
}
