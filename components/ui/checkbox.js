'use client'

import *'react'
import *'@radix-ui/react-checkbox'
import { CheckIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function Checkbox({
 className,
 ...props
}: React.ComponentProps) {
 return (

 </CheckboxPrimitive.Indicator>
 </CheckboxPrimitive.Root>
 )
}

export { Checkbox }
