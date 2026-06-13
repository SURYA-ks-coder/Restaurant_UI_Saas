'use client'

import *'react'
import *'@radix-ui/react-hover-card'

import { cn } from '@/lib/utils'

function HoverCard({
 ...props
}: React.ComponentProps) {
 return 
}

function HoverCardTrigger({
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

function HoverCardContent({
 className,
 align = 'center',
 sideOffset = 4,
 ...props
}: React.ComponentProps) {
 return (

 </HoverCardPrimitive.Portal>
 )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
