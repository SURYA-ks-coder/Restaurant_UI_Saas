import *'react'
import { Slot } from '@radix-ui/react-slot'
import { ChevronRight, MoreHorizontal } from 'lucide-react'

import { cn } from '@/lib/utils'

function Breadcrumb({ ...props }: React.ComponentProps<'nav'>) {
 return 
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
 return (
 
 )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
 return (
 
 )
}

function BreadcrumbLink({
 asChild,
 className,
 ...props
}: React.ComponentProps<'a'> & {
 asChild?}) {
 const Comp = asChild ? Slot : 'a'

 return (
 
 )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
 return (
 
 )
}

function BreadcrumbSeparator({
 children,
 className,
 ...props
}: React.ComponentProps<'li'>) {
 return (
 svg]:size-3.5', className)}
 {...props}
 >
 {children ?? }
 </li>
 )
}

function BreadcrumbEllipsis({
 className,
 ...props
}: React.ComponentProps<'span'>) {
 return (

 More</span>
 </span>
 )
}

export {
 Breadcrumb,
 BreadcrumbList,
 BreadcrumbItem,
 BreadcrumbLink,
 BreadcrumbPage,
 BreadcrumbSeparator,
 BreadcrumbEllipsis,
}
