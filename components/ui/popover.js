'use client'

import *'react'
import *'@radix-ui/react-popover'

import { cn } from '@/lib/utils'

function Popover({
 ...props
}: React.ComponentProps) {
 return 
}

function PopoverTrigger({
 ...props
}: React.ComponentProps) {
 return 
}

function PopoverContent({
 className,
 align = 'center',
 sideOffset = 4,
 ...props
}: React.ComponentProps) {
 return (

 </PopoverPrimitive.Portal>
 )
}

function PopoverAnchor({
 ...props
}: React.ComponentProps) {
 return 
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
