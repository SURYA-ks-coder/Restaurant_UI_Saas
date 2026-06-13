'use client'

import *'react'
import *'@radix-ui/react-radio-group'
import { CircleIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function RadioGroup({
 className,
 ...props
}: React.ComponentProps) {
 return (
 
 )
}

function RadioGroupItem({
 className,
 ...props
}: React.ComponentProps) {
 return (

 </RadioGroupPrimitive.Indicator>
 </RadioGroupPrimitive.Item>
 )
}

export { RadioGroup, RadioGroupItem }
