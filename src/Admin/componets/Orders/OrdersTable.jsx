import React, { useState, useEffect, useMemo } from "react";
import { Input } from "../../../components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "../../../components/ui/dropdown-menu";
import { Button } from "../../../components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
  });
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const convertToIST = (utcDateStr) => {
    const date = new Date(utcDateStr);
    const istDateStr = date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    return istDateStr;
  };

  function extractImageUrl(imageString) {
    const match = imageString.match(/url: '([^']+)'/);
    return match ? match[1] : null;
  }

  useEffect(() => {
    async function fetchOrders() {
      const token = getCookie('jwtToken');
      if (token) {
        try {
          setLoading(true);
          const response = await fetch('https://amrti-main-backend.vercel.app/api/v1/amrti/orders/getOrdersAdmin', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch orders');
          }
          const data = await response.json();
          console.log(data)
          setOrders(data.data.orders);
          console.log(orders)
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchValue = search.toLowerCase();
      const statusFilter = filters.status === "all" || order.status.toLowerCase() === filters.status;
      const dateFilter = filters.dateRange === "all" || new Date(order.createdAt) >= new Date(filters.dateRange);
      
      return (
        (order._id.toLowerCase().includes(searchValue) ||
          order.status.toLowerCase().includes(searchValue)) &&
        statusFilter &&
        dateFilter
      );
    });
  }, [orders, search, filters]);
  
  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div className="container mx-auto mt-16 px-4 md:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-md bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <FilterIcon className="w-5 h-5" />
                <span>Filters</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Filter Orders</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={filters.status}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              >
                <DropdownMenuRadioItem value="all">All Status</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="pending">Pending</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="shipped">Shipped</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="delivered">Delivered</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="cancelled">Cancelled</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Date Range</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={filters.dateRange}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value }))}
              >
                <DropdownMenuRadioItem value="all">All Time</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="last30days">Last 30 Days</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="last90days">Last 90 Days</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="custom">Custom Range</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Order #</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <React.Fragment key={order._id}>
                <TableRow className="group cursor-pointer hover:bg-muted/50" onClick={() => toggleOrderExpansion(order._id)}>
                  <TableCell>
                    {expandedOrder === order._id ? (
                      <ChevronUpIcon className="w-5 h-5" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5" />
                    )}
                  </TableCell>
                  <TableCell>
                    <p>{order._id}</p>
                  </TableCell>
                  <TableCell>
                    <p>{order.userId.name}</p>
                  </TableCell>
                  <TableCell>
                    <p>{order.shippingAddress.contact}</p>
                  </TableCell>
                  <TableCell>{convertToIST(order.createdAt)}</TableCell>
                  <TableCell>₹{order.totalAmount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status.toLowerCase() === "pending"
                          ? "warning"
                          : order.status.toLowerCase() === "shipped"
                          ? "info"
                          : order.status.toLowerCase() === "delivered"
                          ? "success"
                          : "danger"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
                {expandedOrder === order._id && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="p-4 bg-muted/20 rounded-md">
                        <h3 className="font-semibold mb-2">Shipping Address:</h3>
                        <p>
                          {order.shippingAddress.addr}, {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.zip}
                        </p>
                        <h3 className="font-semibold mt-4 mb-2">Order Items:</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Image</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Price</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {order.items.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <img src={extractImageUrl(item.image)} alt={item.name} className="w-12 h-12 object-cover rounded" />
                                </TableCell>
                                <TableCell>{item.title}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>₹{item.price}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function FilterIcon(props) {
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
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function SearchIcon(props) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}