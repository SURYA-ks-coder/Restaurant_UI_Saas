'use client'

import { useMemo } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

function FieldSet({ className, ...props }: React.ComponentProps<'fieldset'>) {
 return (
 [data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3',
 className,
 )}
 {...props}
 />
 )
}

function FieldLegend({
 className,
 variant = 'legend',
 ...props
}: React.ComponentProps<'legend'> & { variant?: 'legend' | 'label' }) {
 return (
 
 )
}

function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
 return (
 [data-slot=field-group]]:gap-4',
 className,
 )}
 {...props}
 />
 )
}

const fieldVariants = cva(
 'group/field flex w-full gap-3 data-[invalid=true]:text-destructive',
 {
 variants: {
 orientation: {
 vertical: ['flex-col [&>*]:w-full [&>.sr-only]:w-auto'],
 horizontal: [
 'flex-row items-center',
 '[&>[data-slot=field-label]]:flex-auto',
 'has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]=checkbox],[role=radio]]:mt-px',
 ],
 responsive: [
 'flex-col [&>*]:w-full [&>.sr-only]:w-auto @md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto',
 '@md/field-group:[&>[data-slot=field-label]]:flex-auto',
 '@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]=checkbox],[role=radio]]:mt-px',
 ],
 },
 },
 defaultVariants: {
 orientation: 'vertical',
 },
 },
)

function Field({
 className,
 orientation = 'vertical',
 ...props
}: React.ComponentProps<'div'> & VariantProps) {
 return (
 
 )
}

function FieldContent({ className, ...props }: React.ComponentProps<'div'>) {
 return (
 
 )
}

function FieldLabel({
 className,
 ...props
}) {
 return (
 [data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4',
 'has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10',
 className,
 )}
 {...props}
 />
 )
}

function FieldTitle({ className, ...props }: React.ComponentProps<'div'>) {
 return (
 
 )
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
 return (
 a]:text-primary [&>a]]:underline-offset-4',
 className,
 )}
 {...props}
 />
 )
}

function FieldSeparator({
 children,
 className,
 ...props
}: React.ComponentProps<'div'> & {
 children?
}) {
 return (

 {children && (
 
 {children}
 </span>
 )}
 </div>
 )
}

function FieldError({
 className,
 children,
 errors,
 ...props
}: React.ComponentProps<'div'> & {
 errors?} | undefined>
}) {
 const content = useMemo(() => {
 if (children) {
 return children
 }

 if (!errors) {
 return null
 }

 if (errors.length === 1 && errors[0]?.message) {
 return errors[0].message
 }

 return (
 
 {errors.map(
 (error, index) =>
 error?.message && {error.message}</li>,
 )}
 </ul>
 )
 }, [children, errors])

 if (!content) {
 return null
 }

 return (
 
 {content}
 </div>
 )
}

export {
 Field,
 FieldLabel,
 FieldDescription,
 FieldError,
 FieldGroup,
 FieldLegend,
 FieldSeparator,
 FieldSet,
 FieldContent,
 FieldTitle,
}
