// app/checkout/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Banknote,
  Truck,
  ShoppingBag,
  Loader2
} from 'lucide-react';

const checkoutSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().min(2, 'Full name is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().min(6, 'Valid ZIP code is required'),
    landmark: z.string().optional(),
  }),
  paymentMethod: z.enum(['cash_on_delivery', 'upi', 'card', 'net_banking']),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: string[];
    price: number;
    quantity: number;
  };
  quantity: number;
  price: number;
  selectedVariants?: {
    type: string;
    value: string;
    price: number;
  }[];
}

export default function CheckoutPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: {
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        landmark: '',
      },
      paymentMethod: 'cash_on_delivery',
      notes: '',
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin?callbackUrl=/checkout');
      return;
    }

    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cart?.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart items');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const variantPrice = item.selectedVariants?.reduce((sum, variant) => sum + variant.price, 0) || 0;
      return total + ((item.price + variantPrice) * item.quantity);
    }, 0);
  };

  const calculateTax = (subtotal: number) => {
    return Math.round(subtotal * 0.18); // 18% GST
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 500 ? 0 : 50; // Free shipping above ₹500
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const shipping = calculateShipping();
    return subtotal + tax + shipping;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsPlacingOrder(true);

    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item.product._id,
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          image: item.product.images[0] || '',
          selectedVariants: item.selectedVariants || []
        })),
        subtotal: calculateSubtotal(),
        tax: calculateTax(calculateSubtotal()),
        shipping: calculateShipping(),
        totalAmount: calculateTotal(),
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      };

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Order placed successfully!');
        router.push(`/orders/${result.order._id}/confirmation`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to place order');
      }
    } catch (error) {
      toast.error('An error occurred while placing order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-6">Add some products to proceed with checkout</p>
                <Link href="/products">
                  <Button className="bg-red-600 hover:bg-red-700">
                    Browse Products
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/cart">
            <Button variant="outline" size="sm" className="border-red-600 text-red-600 hover:bg-red-50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cart
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600">Complete your order</p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <Card>
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="flex items-center">
                    <Truck className="mr-2 h-5 w-5 text-red-600" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        {...form.register('shippingAddress.fullName')}
                        className={form.formState.errors.shippingAddress?.fullName ? 'border-red-500' : ''}
                      />
                      {form.formState.errors.shippingAddress?.fullName && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.shippingAddress.fullName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 9876543210"
                        {...form.register('shippingAddress.phone')}
                        className={form.formState.errors.shippingAddress?.phone ? 'border-red-500' : ''}
                      />
                      {form.formState.errors.shippingAddress?.phone && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.shippingAddress.phone.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="street">Street Address *</Label>
                      <Input
                        id="street"
                        placeholder="House/Flat No., Street Name"
                        {...form.register('shippingAddress.street')}
                        className={form.formState.errors.shippingAddress?.street ? 'border-red-500' : ''}
                      />
                      {form.formState.errors.shippingAddress?.street && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.shippingAddress.street.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        {...form.register('shippingAddress.city')}
                        className={form.formState.errors.shippingAddress?.city ? 'border-red-500' : ''}
                      />
                      {form.formState.errors.shippingAddress?.city && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.shippingAddress.city.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        {...form.register('shippingAddress.state')}
                        className={form.formState.errors.shippingAddress?.state ? 'border-red-500' : ''}
                      />
                      {form.formState.errors.shippingAddress?.state && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.shippingAddress.state.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        placeholder="110001"
                        {...form.register('shippingAddress.zipCode')}
                        className={form.formState.errors.shippingAddress?.zipCode ? 'border-red-500' : ''}
                      />
                      {form.formState.errors.shippingAddress?.zipCode && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.shippingAddress.zipCode.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="landmark">Landmark (Optional)</Label>
                      <Input
                        id="landmark"
                        placeholder="Near Metro Station"
                        {...form.register('shippingAddress.landmark')}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5 text-red-600" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <RadioGroup
                    value={form.watch('paymentMethod')}
                    onValueChange={(value: any) => form.setValue('paymentMethod', value as any)}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-4 border border-gray-200 hover:bg-gray-50">
                        <RadioGroupItem value="cash_on_delivery" id="cod" />
                        <Label htmlFor="cod" className="flex items-center cursor-pointer flex-1">
                          <Banknote className="mr-3 h-5 w-5 text-green-600" />
                          <div>
                            <div className="font-medium">Cash on Delivery</div>
                            <div className="text-sm text-gray-600">Pay when you receive your order</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 border border-gray-200 hover:bg-gray-50">
                        <RadioGroupItem value="upi" id="upi" />
                        <Label htmlFor="upi" className="flex items-center cursor-pointer flex-1">
                          <Smartphone className="mr-3 h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium">UPI Payment</div>
                            <div className="text-sm text-gray-600">Pay using UPI apps like GPay, PhonePe</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 border border-gray-200 hover:bg-gray-50 opacity-50">
                        <RadioGroupItem value="card" id="card" disabled />
                        <Label htmlFor="card" className="flex items-center cursor-pointer flex-1">
                          <CreditCard className="mr-3 h-5 w-5 text-purple-600" />
                          <div>
                            <div className="font-medium">Credit/Debit Card</div>
                            <div className="text-sm text-gray-600">Coming Soon</div>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card>
                <CardHeader className="border-b border-gray-200">
                  <CardTitle>Order Notes (Optional)</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Textarea
                    placeholder="Any special instructions for delivery..."
                    rows={3}
                    {...form.register('notes')}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Order Items */}
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item._id} className="flex items-center space-x-3">
                        <img
                          src={item.product.images[0] || '/placeholder-product.jpg'}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover border border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity}
                          </p>
                          {item.selectedVariants && item.selectedVariants.length > 0 && (
                            <p className="text-xs text-gray-500">
                              {item.selectedVariants.map(v => `${v.type}: ${v.value}`).join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="text-sm font-medium">
                          {formatPrice((item.price + (item.selectedVariants?.reduce((sum, v) => sum + v.price, 0) || 0)) * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(calculateSubtotal())}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (GST 18%)</span>
                      <span>{formatPrice(calculateTax(calculateSubtotal()))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>
                        {calculateShipping() === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          formatPrice(calculateShipping())
                        )}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>

                  {calculateShipping() > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Add {formatPrice(500 - calculateSubtotal())} more for free shipping
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full mt-6 bg-red-600 hover:bg-red-700"
                    disabled={isPlacingOrder}
                  >
                    {isPlacingOrder ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      `Place Order - ${formatPrice(calculateTotal())}`
                    )}
                  </Button>

                  <p className="text-xs text-gray-600 mt-3 text-center">
                    By placing this order, you agree to our Terms of Service and Privacy Policy
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
