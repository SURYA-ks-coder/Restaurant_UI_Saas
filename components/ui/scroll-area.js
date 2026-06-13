'use client'

import *'react'
import *'@radix-ui/react-scroll-area'

import { cn } from '@/lib/utils'

function ScrollArea({
 className,
 children,
 ...props
}: React.ComponentProps) {
 return (

 {children}
 </ScrollAreaPrimitive.Viewport>

 </ScrollAreaPrimitive.Root>
 )
}

function ScrollBar({
 className,
 orientation = 'vertical',
 ...props
}: React.ComponentProps) {
 return (

 </ScrollAreaPrimitive.ScrollAreaScrollbar>
 )
}

export { ScrollArea, ScrollBar }
