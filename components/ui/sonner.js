'use client'

import { useTheme } from 'next-themes'
import { Toaster} from 'sonner'

const Toaster = ({ ...props }) => {
 const { theme = 'system' } = useTheme()

 return (
 
 )
}

export { Toaster }
