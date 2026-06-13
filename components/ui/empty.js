import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

function Empty({ className, ...props }: React.ComponentProps<'div'>) {
 return (
 
 )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<'div'>) {
 return (
 
 )
}

const emptyMediaVariants = cva(
 'flex shrink-0 items-center justify-center mb-2 [&_svg]:pointer-events-none [&_svg]:shrink-0',
 {
 variants: {
 variant: {
 default: 'bg-transparent',
 icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
 },
 },
 defaultVariants: {
 variant: 'default',
 },
 },
)

function EmptyMedia({
 className,
 variant = 'default',
 ...props
}: React.ComponentProps<'div'> & VariantProps) {
 return (
 
 )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<'div'>) {
 return (
 
 )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<'p'>) {
 return (
 a]:text-primary text-sm/relaxed [&>a]]:underline-offset-4',
 className,
 )}
 {...props}
 />
 )
}

function EmptyContent({ className, ...props }: React.ComponentProps<'div'>) {
 return (
 
 )
}

export {
 Empty,
 EmptyHeader,
 EmptyTitle,
 EmptyDescription,
 EmptyContent,
 EmptyMedia,
}
