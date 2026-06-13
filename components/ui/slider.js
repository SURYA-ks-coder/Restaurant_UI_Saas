'use client'

import *'react'
import *'@radix-ui/react-slider'

import { cn } from '@/lib/utils'

function Slider({
 className,
 defaultValue,
 value,
 min = 0,
 max = 100,
 ...props
}: React.ComponentProps) {
 const _values = React.useMemo(
 () =>
 Array.isArray(value)
 ? value
 .isArray(defaultValue)
 ? defaultValue
 )

 return (

 </SliderPrimitive.Track>
 {Array.from({ length: _values.length }, (_, index) => (
 
 ))}
 </SliderPrimitive.Root>
 )
}

export { Slider }
