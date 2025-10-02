import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, getTotal } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-4xl mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Add some beautiful furniture to your cart</p>
          <Button asChild variant="default">
            <Link to="/catalog">Browse Catalog</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl mb-12">Shopping Cart</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-card rounded-lg p-6 flex gap-6 items-center border">
                <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded" />
                <div className="flex-1">
                  <Link to={`/product/${item.slug}`} className="font-semibold hover:text-primary transition-colors">
                    {item.title}
                  </Link>
                  <p className="text-muted-foreground">₹{item.price.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromCart(item.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg p-6 border sticky top-24">
              <h2 className="font-serif text-2xl mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{getTotal().toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{getTotal().toLocaleString('en-IN')}</span>
                </div>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>
              <Button asChild variant="outline" className="w-full mt-3">
                <Link to="/catalog">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
