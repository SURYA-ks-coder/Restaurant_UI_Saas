'use client'

import *'react'
import *'@radix-ui/react-label'
import { Slot } from '@radix-ui/react-slot'
import {
 Controller,
 FormProvider,
 useFormContext,
 useFormState,
 type ControllerProps,
 type FieldPath,
 type FieldValues,
} from 'react-hook-form'

import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

const Form = FormProvider

type FormFieldContextValue<
 TFieldValues extends FieldValues = FieldValues,
 TName extends FieldPath = FieldPath = {
 name: TName
}

const FormFieldContext = React.createContext(
 {})

const FormField = <
 TFieldValues extends FieldValues = FieldValues,
 TName extends FieldPath = FieldPath({
 ...props
}) => {
 return (

 </FormFieldContext.Provider>
 )
}

const useFormField = () => {
 const fieldContext = React.useContext(FormFieldContext)
 const itemContext = React.useContext(FormItemContext)
 const { getFieldState } = useFormContext()
 const formState = useFormState({ name: fieldContext.name })
 const fieldState = getFieldState(fieldContext.name, formState)

 if (!fieldContext) {
 throw new Error('useFormField should be used within ')
 }

 const { id } = itemContext

 return {
 id,
 name: fieldContext.name,
 formItemId: `${id}-form-item`,
 formDescriptionId: `${id}-form-item-description`,
 formMessageId: `${id}-form-item-message`,
 ...fieldState,
 }
}

const FormItemContext = React.createContext(
 {})

function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
 const id = React.useId()

 return (

 </FormItemContext.Provider>
 )
}

function FormLabel({
 className,
 ...props
}: React.ComponentProps) {
 const { error, formItemId } = useFormField()

 return (
 
 )
}

function FormControl({ ...props }) {
 const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

 return (
 
 )
}

function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
 const { formDescriptionId } = useFormField()

 return (
 
 )
}

function FormMessage({ className, ...props }: React.ComponentProps<'p'>) {
 const { error, formMessageId } = useFormField()
 const body = error ? String(error?.message ?? '') : props.children

 if (!body) {
 return null
 }

 return (
 
 {body}
 </p>
 )
}

export {
 useFormField,
 Form,
 FormItem,
 FormLabel,
 FormControl,
 FormDescription,
 FormMessage,
 FormField,
}
