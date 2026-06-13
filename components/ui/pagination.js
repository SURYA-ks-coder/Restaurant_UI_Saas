import *'react'
import {
 ChevronLeftIcon,
 ChevronRightIcon,
 MoreHorizontalIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/ButtonClick'

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
 return (
 
 )
}

function PaginationContent({
 className,
 ...props
}: React.ComponentProps<'ul'>) {
 return (
 
 )
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
 return 
}

 & Pick &
 React.ComponentProps<'a'>

function PaginationLink({
 className,
 isActive,
 size = 'icon',
 ...props
}) {
 return (
 
 )
}

function PaginationPrevious({
 className,
 ...props
}) {
 return (

 Previous</span>
 </PaginationLink>
 )
}

function PaginationNext({
 className,
 ...props
}) {
 return (
 
 Next</span>
 
 </PaginationLink>
 )
}

function PaginationEllipsis({
 className,
 ...props
}: React.ComponentProps<'span'>) {
 return (

 More pages</span>
 </span>
 )
}

export {
 Pagination,
 PaginationContent,
 PaginationLink,
 PaginationItem,
 PaginationPrevious,
 PaginationNext,
 PaginationEllipsis,
}
