'use client'

import *'react'
import { GripVerticalIcon } from 'lucide-react'
import *'react-resizable-panels'

import { cn } from '@/lib/utils'

function ResizablePanelGroup({
 className,
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

function ResizablePanel({
 ...props
}: React.ComponentProps) {
 return 
}

function ResizableHandle({
 withHandle,
 className,
 ...props
}: React.ComponentProps & {
 withHandle?}) {
 return (
 div]:rotate-90',
 className,
 )}
 {...props}
 >
 {withHandle && (

 </div>
 )}
 </ResizablePrimitive.PanelResizeHandle>
 )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
