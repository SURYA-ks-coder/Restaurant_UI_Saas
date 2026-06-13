'use client'

import *'react'
import *'@radix-ui/react-tooltip'

import { cn } from '@/lib/utils'

function TooltipProvider({
 delayDuration = 0,
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

function Tooltip({
 ...props
}: React.ComponentProps) {
 return (

 </TooltipProvider>
 )
}

function TooltipTrigger({
 ...props
}: React.ComponentProps) {
 return 
}

function TooltipContent({
 className,
 sideOffset = 0,
 children,
 ...props
}: React.ComponentProps) {
 return (

 {children}
 
 </TooltipPrimitive.Content>
 </TooltipPrimitive.Portal>
 )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
