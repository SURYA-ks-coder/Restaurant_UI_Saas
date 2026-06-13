"use client"

import { useState } from "react"
import { Clock, Flame, Minus, Plus, Search, ShoppingCart, Star, UtensilsCrossed, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const categories = [
  { id: "popular", name: "Popular", icon: Flame },
  { id: "starters", name: "Starters" },
  { id: "mains", name: "Mains" },
  { id: "seafood", name: "Seafood" },
  { id: "pasta", name: "Pasta" },
  { id: "desserts", name: "Desserts" },
  { id: "drinks", name: "Drinks" },
]

const menuItems = [
  { id: 1, name: "Wagyu Beef Steak", description: "Premium Japanese A5 wagyu, truffle butter, seasonal vegetables", price: 68, category: "mains", rating: 4.9, popular: true, prepTime: "25 min", tags: ["signature"] },
  { id: 2, name: "Truffle Pasta", description: "Fresh tagliatelle, black truffle, parmesan cream sauce", price: 42, category: "pasta", rating: 4.8, popular: true, prepTime: "18 min", tags: ["vegetarian"] },
  { id: 3, name: "Lobster Bisque", description: "Creamy lobster soup with cognac and fresh herbs", price: 28, category: "starters", rating: 4.7, popular: true, prepTime: "10 min", tags: [] },
  { id: 4, name: "Chocolate Lava Cake", description: "Warm chocolate fondant with vanilla bean ice cream", price: 16, category: "desserts", rating: 4.9, popular: true, prepTime: "15 min", tags: ["must-try"] },
  { id: 5, name: "Grilled Salmon", description: "Atlantic salmon, lemon dill butter, roasted asparagus", price: 45, category: "seafood", rating: 4.6, popular: true, prepTime: "20 min", tags: ["healthy"] },
  { id: 6, name: "Caesar Salad", description: "Romaine lettuce, parmesan, croutons, house-made dressing", price: 18, category: "starters", rating: 4.5, popular: false, prepTime: "8 min", tags: ["vegetarian"] },
]

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState("popular")
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "popular" ? item.popular : item.category === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id)
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        )
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }]
    })
  }

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    )
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <main className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 p-4 backdrop-blur">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Flavor Hub</h1>
              <p className="text-sm text-muted-foreground">Table 5</p>
            </div>
            <button onClick={() => setShowCart(true)} className="relative rounded-lg bg-muted p-3">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">{cartCount}</span>
              )}
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="pl-10" placeholder="Search dishes" />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium",
                    selectedCategory === category.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {category.name}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-5xl gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <article key={item.id} className="glass-card rounded-lg p-4">
            <button onClick={() => setSelectedItem(item)} className="w-full text-left">
              <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-muted">
                <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="mb-2 flex items-start justify-between gap-3">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="font-semibold">${item.price.toFixed(2)}</p>
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="h-3 w-3 text-warning" /> {item.rating}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.prepTime}</span>
              </div>
            </button>
            <button onClick={() => addToCart(item)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 py-2 text-sm font-medium text-primary">
              <Plus className="h-4 w-4" />
              Add to order
            </button>
          </article>
        ))}
      </section>

      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-20 mx-auto max-w-5xl">
          <button onClick={() => setShowCart(true)} className="flex w-full items-center justify-between rounded-lg bg-primary px-5 py-4 font-medium text-primary-foreground">
            <span>View Order ({cartCount} items)</span>
            <span>${cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setShowCart(false)}>
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-lg bg-background p-5" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Order</h2>
              <button onClick={() => setShowCart(false)} className="rounded-lg p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="rounded-lg bg-muted p-2"><Minus className="h-3 w-3" /></button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="rounded-lg bg-muted p-2"><Plus className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="mt-5 border-t border-border pt-5">
                <div className="mb-4 flex justify-between text-lg font-semibold"><span>Total</span><span>${cartTotal.toFixed(2)}</span></div>
                <button className="w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground">Place Order</button>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setSelectedItem(null)}>
          <div className="absolute bottom-0 left-0 right-0 rounded-t-lg bg-background p-5" onClick={(event) => event.stopPropagation()}>
            <button onClick={() => setSelectedItem(null)} className="absolute right-4 top-4 rounded-lg p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
            <div className="mb-5 flex h-44 items-center justify-center rounded-lg bg-muted">
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold">{selectedItem.name}</h2>
            <p className="mt-2 text-muted-foreground">{selectedItem.description}</p>
            <button
              onClick={() => {
                addToCart(selectedItem)
                setSelectedItem(null)
              }}
              className="mt-6 w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground"
            >
              Add to order - ${selectedItem.price.toFixed(2)}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
