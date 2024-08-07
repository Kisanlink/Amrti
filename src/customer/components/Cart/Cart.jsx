"use client"

import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../../components/ui/card"
import { Separator } from "../../../components/ui/separator"
import { useNavigate } from "react-router-dom"

export default function Component() {
  const [cart, setCart] = useState([])
  const [total, setTotal] = useState(0)
  const navigate=useNavigate()


   const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

 const token = getCookie('jwtToken');

 function extractImageUrl(imageString) {
  const match = imageString.match(/url: '([^']+)'/);
  return match ? match[1] : null;
}

  useEffect(() => {
    async function fetchCart() {
    
      if (!token) {
        console.error("No token found")
        return
      }

      try {
        const response = await fetch("https://amrti-main-backend.vercel.app/api/v1/amrti/cart/getCart", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!response.ok) {
          throw new Error("Failed to fetch cart data")
        }
        const data = await response.json()
        console.log(data)
      
        const fetchedCart = data.data.cart.items.map(item => ({


          
          id: item._id,
          name: item.title, // Assuming you'll replace this with the actual product name fetched from another endpoint or database
          price: item.price, // Assuming price is in cents
          image: "/placeholder.svg", // Placeholder for the product image
          quantity: item.quantity,
          imageUrl: extractImageUrl(item.image),
          productId:item.productId
        }))
        console.log(fetchedCart)
        setCart(fetchedCart)
        setTotal(data.data.cart.totalPrice ) // Assuming totalPrice is in cents
      } catch (error) {
        console.error("Error fetching cart:", error)
      }
    }

    fetchCart()
  }, [])

const handleQuantityChange = async (id,productId) => {
  if (!token) {
    console.error("No token found");
    return;
  }

  try {
    const response = await fetch("https://amrti-main-backend.vercel.app/api/v1/amrti/cart/quantity/plusone", {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId })
    });

    if (!response.ok) {
      throw new Error("Failed to update cart");
    }

    const data = await response.json();
    console.log(data)

     setCart(cart.map((item) =>
      item.id === id ? { ...item, quantity: data.data.updatedProduct.quantity } : item
    ));
    setTotal(data.data.totalPrice )

    

  } catch (error) {
    console.error("Error updating cart:", error);
  }
};
  
const handleRemoveItem = async (id,productId) => {
  if (!token) {
    console.error("No token found");
    return;
  }

  try {
    const response = await fetch("https://amrti-main-backend.vercel.app/api/v1/amrti/cart/quantity/reduceone", {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId })
    });

    if (!response.ok) {
      throw new Error("Failed to update cart");
    }

    const data = await response.json();

     setCart(cart.map((item) =>
      item.id === id ? { ...item, quantity: data.data.updatedProduct.quantity } : item
    ));

    setTotal(data.data.totalPrice )

    

  } catch (error) {
    console.error("Error updating cart:", error);
  }
};


const handleProductRemove = async (id,productId) => {
  if (!token) {
    console.error("No token found");
    return;
  }

  try {
    const response = await fetch("https://amrti-main-backend.vercel.app/api/v1/amrti/cart/removeproduct", {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId })
    });

    if (!response.ok) {
      throw new Error("Failed to update cart");
    }

    const data = await response.json();
    console.log(data)

const fetchedCart = data.cart.items.map(item => ({


          
          id: item._id,
          name: item.title, // Assuming you'll replace this with the actual product name fetched from another endpoint or database
          price: item.price, // Assuming price is in cents
          image: "/placeholder.svg", // Placeholder for the product image
          quantity: item.quantity,
          imageUrl: extractImageUrl(item.image),
          productId:item.productId
     }))

      setCart(fetchedCart)
        setTotal(data.cart.totalPrice )


    

  } catch (error) {
    console.error("Error updating cart:", error);
  }
};

const handleCheckout = async() => {

  
  try {
    const response = await fetch("https://amrti-main-backend.vercel.app/api/v1/amrti/cart/proceed", {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
  
    });

    if (!response.ok) {
      throw new Error("Failed to proceed");
    }


  navigate('/delivery');
}catch (error) {
  console.error("Error updating cart:", error);
}
}


const handleContinueShopping = () => {
  navigate('/products');
};

  return (
    <div className="container mx-auto px-4 md:px-6 py-24">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      <div className="grid gap-6 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_400px]">
        <div className="grid gap-6">
          {cart.map((item) => (
            <div key={item.id} className="grid grid-cols-[100px_1fr_auto] items-center gap-4">
              <img
                src={item.imageUrl}
                alt={item.name}
                width={100}
                height={100}
                className="rounded-lg object-cover"
              />
              <div className="grid gap-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-muted-foreground">{item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveItem(item.id,item.productId)}
                  disabled={item.quantity <= 1}
                >
                  <MinusIcon className="w-4 h-4" />
                </Button>
                <span>{item.quantity}</span>
                <Button variant="outline" size="icon" onClick={() => handleQuantityChange(item.id,item.productId)}>
                  <PlusIcon className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleProductRemove(item.id,item.productId)}>
                  <XIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <p>Subtotal</p>
                <p>{total}</p>
              </div>
              <div className="flex items-center justify-between">
                <p>Shipping</p>
                <p>Free</p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <p className="font-semibold">Total</p>
                <p className="font-semibold">{total}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleContinueShopping}>
              Continue Shopping
            </Button>
            <Button className="flex-1" onClick={handleCheckout}>Proceed to Checkout</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

function MinusIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
    </svg>
  )
}

function PlusIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
