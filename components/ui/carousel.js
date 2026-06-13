'use client'

import *'react'
import useEmblaCarousel, {
 type UseEmblaCarouselType,
} from 'embla-carousel-react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/ButtonClick'

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

 & CarouselProps

const CarouselContext = React.createContext(null)

function useCarousel() {
 const context = React.useContext(CarouselContext)

 if (!context) {
 throw new Error('useCarousel must be used within a ')
 }

 return context
}

function Carousel({
 orientation = 'horizontal',
 opts,
 setApi,
 plugins,
 className,
 children,
 ...props
}: React.ComponentProps<'div'> & CarouselProps) {
 const [carouselRef, api] = useEmblaCarousel(
 {
 ...opts,
 axis=== 'horizontal' ? 'x' : 'y',
 },
 plugins,
 )
 const [canScrollPrev, setCanScrollPrev] = React.useState(false)
 const [canScrollNext, setCanScrollNext] = React.useState(false)

 const onSelect = React.useCallback((api) => {
 if (!api) return
 setCanScrollPrev(api.canScrollPrev())
 setCanScrollNext(api.canScrollNext())
 }, [])

 const scrollPrev = React.useCallback(() => {
 api?.scrollPrev()
 }, [api])

 const scrollNext = React.useCallback(() => {
 api?.scrollNext()
 }, [api])

 const handleKeyDown = React.useCallback(
 (event) => {
 if (event.key === 'ArrowLeft') {
 event.preventDefault()
 scrollPrev()
 } else if (event.key === 'ArrowRight') {
 event.preventDefault()
 scrollNext()
 }
 },
 [scrollPrev, scrollNext],
 )

 React.useEffect(() => {
 if (!api || !setApi) return
 setApi(api)
 }, [api, setApi])

 React.useEffect(() => {
 if (!api) return
 onSelect(api)
 api.on('reInit', onSelect)
 api.on('select', onSelect)

 return () => {
 api?.off('select', onSelect)
 }
 }, [api, onSelect])

 return (

 {children}
 </div>
 </CarouselContext.Provider>
 )
}

function CarouselContent({ className, ...props }: React.ComponentProps<'div'>) {
 const { carouselRef, orientation } = useCarousel()

 return (

 </div>
 )
}

function CarouselItem({ className, ...props }: React.ComponentProps<'div'>) {
 const { orientation } = useCarousel()

 return (
 
 )
}

function CarouselPrevious({
 className,
 variant = 'outline',
 size = 'icon',
 ...props
}) {
 const { orientation, scrollPrev, canScrollPrev } = useCarousel()

 return (

 Previous slide</span>
 </Button>
 )
}

function CarouselNext({
 className,
 variant = 'outline',
 size = 'icon',
 ...props
}) {
 const { orientation, scrollNext, canScrollNext } = useCarousel()

 return (

 Next slide</span>
 </Button>
 )
}

export {
 type CarouselApi,
 Carousel,
 CarouselContent,
 CarouselItem,
 CarouselPrevious,
 CarouselNext,
}
