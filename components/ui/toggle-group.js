'use client'

import *'react'
import *'@radix-ui/react-toggle-group'
import { type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { toggleVariants } from '@/components/ui/toggle'

const ToggleGroupContext = React.createContext<
 VariantProps({
 size: 'default',
 variant: 'default',
})

function ToggleGroup({
 className,
 variant,
 size,
 children,
 ...props
}: React.ComponentProps &
 VariantProps) {
 return (

 {children}
 </ToggleGroupContext.Provider>
 </ToggleGroupPrimitive.Root>
 )
}

function ToggleGroupItem({
 className,
 children,
 variant,
 size,
 ...props
}: React.ComponentProps &
 VariantProps) {
 const context = React.useContext(ToggleGroupContext)

 return (
 
 {children}
 </ToggleGroupPrimitive.Item>
 )
}

export { ToggleGroup, ToggleGroupItem }
