'use client'

import *'react'
import { OTPInput, OTPInputContext } from 'input-otp'
import { MinusIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function InputOTP({
 className,
 containerClassName,
 ...props
} & {
 containerClassName?}) {
 return (
 
 )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
 return (
 
 )
}

function InputOTPSlot({
 index,
 className,
 ...props
}: React.ComponentProps<'div'> & {
 index
}) {
 const inputOTPContext = React.useContext(OTPInputContext)
 const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

 return (
 
 {char}
 {hasFakeCaret && (

 </div>
 )}
 </div>
 )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<'div'>) {
 return (

 </div>
 )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
