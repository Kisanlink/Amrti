import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { FaTrashAlt } from 'react-icons/fa'; // Import dustbin icon from react-icons

const countryCodes = {
  in: "+91",
  us: "+1",
  ca: "+1",
  mx: "+52",
  gb: "+44",
  au: "+61",
  de: "+49",
  fr: "+33",
};

export default function Delivery() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    countryCode: "",
    contact: ""
  });
  const [errors, setErrors] = useState({});
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  useEffect(() => {
    fetchSavedAddresses();
  }, []);

  const fetchSavedAddresses = async () => {
    const token = getCookie('jwtToken');
    try {
      const response = await fetch('https://amrti-main-backend.vercel.app/api/v1/amrti/address/getAddress', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const addresses = await response.json();
        setSavedAddresses(addresses.addresses);
      }
    } catch (error) {
      console.error('Error fetching saved addresses:', error);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    let newValue = value;
    
    if (id === 'contact') {
      newValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    setFormData(prevData => ({
      ...prevData,
      [id]: newValue
    }));
    setErrors(prevErrors => ({
      ...prevErrors,
      [id]: ''
    }));
  };

  const handleSelectChange = (id, value) => {
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
    setErrors(prevErrors => ({
      ...prevErrors,
      [id]: ''
    }));

    if (id === 'country') {
      setFormData(prevData => ({
        ...prevData,
        countryCode: countryCodes[value] || ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    const zipRegex = /^\d{5,6}$/;

    if (!formData.name.trim() || !nameRegex.test(formData.name.trim())) {
      newErrors.name = 'Please enter a valid name (2-50 characters, letters only)';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.zip.trim() || !zipRegex.test(formData.zip.trim())) {
      newErrors.zip = 'Please enter a valid 5-6 digit zip code';
    }
    if (!formData.country) {
      newErrors.country = 'Please select a country';
    }
    if (!formData.countryCode) {
      newErrors.countryCode = 'Please select a country code';
    }
    if (!formData.contact || formData.contact.length !== 10) {
      newErrors.contact = 'Please enter a valid 10-digit contact number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const token = getCookie('jwtToken');
      
      try {
        // Save address
        const addressResponse = await fetch('https://amrti-main-backend.vercel.app/api/v1/amrti/address/createAddress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        const addressData = await addressResponse.json();
        if (addressResponse.ok) {
          fetchSavedAddresses();  // Refresh the list of saved addresses
          proceedToPayment(addressData.cartPrice);
        } else {
          setPaymentStatus('Failed to save delivery information');
        }
      } catch (error) {
        console.error('Error:', error);
        setPaymentStatus('An error occurred');
      }
    }
  };

  const proceedToPayment = async (amount, addressId) => {
    const token = getCookie('jwtToken');
    try {
      const paymentResponse = await fetch('https://amrti-main-backend.vercel.app/api/v1/amrti/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: amount,
          addressId: addressId,
          redirectUrl: 'https://amrti-main-backend.vercel.app/api/v1/amrti/payment/verify/:merchantTransactionId',
        }),
      });

      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        window.location.href = paymentData.redirectUrl;
      } else {
        setPaymentStatus('Failed to initiate payment');
      }
    } catch (error) {
      console.error('Error:', error);
      setPaymentStatus('An error occurred during payment initiation');
    }
  };

  const handleAddressSelection = (addressId) => {
    setSelectedAddressId(addressId);
  };

  const handleUseSelectedAddress = async () => {
    if (selectedAddressId) {
      try {
        const token = getCookie('jwtToken');
        const response = await fetch('https://amrti-main-backend.vercel.app/api/v1/amrti/address/getaddressid', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ addressId: selectedAddressId }),
        });

        if (response.ok) {
          const addressData = await response.json();
          proceedToPayment(addressData.cartPrice, selectedAddressId);
        } else {
          setPaymentStatus('Failed to fetch selected address');
        }
      } catch (error) {
        console.error('Error:', error);
        setPaymentStatus('An error occurred');
      }
    }
  };

  const handleDeleteAddress = async (addressId) => {
    const token = getCookie('jwtToken');
    try {
      const response = await fetch('https://amrti-main-backend.vercel.app/api/v1/amrti/address/deleteaddress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ addressId }),
      });

      if (response.ok) {
        fetchSavedAddresses(); // Refresh the list of saved addresses
      } else {
        console.error('Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">Delivery Information</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Choose a saved address or add a new one to proceed with your order.
          </p>
        </div>

        {savedAddresses.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Saved Addresses</h2>
            <RadioGroup onValueChange={handleAddressSelection} className="space-y-2">
              {savedAddresses.map((address, index) => (
               
               <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
               <RadioGroupItem
                 id={`address-${index}`}
                 value={address._id}
                 className="mr-4"
                 checked={selectedAddressId === address._id}
               />
               <label htmlFor={`address-${index}`} className="flex-1">
                 <div className="text-sm font-medium">{address.name}</div>
                 <div className="text-sm">{address.address}</div>
                 <div className="text-sm">{address.city}, {address.state}, {address.zip}</div>
                 <div className="text-sm">{address.country}</div>
                 <div className="text-sm">{address.countryCode} {address.contact}</div>
               </label>
               <button onClick={() => handleDeleteAddress(address._id)} className="text-red-600 hover:text-red-800">
                 <FaTrashAlt />
               </button>
             </div>
           ))}
         </RadioGroup>
         <Button onClick={handleUseSelectedAddress} disabled={!selectedAddressId}>
           Use Selected Address
         </Button>
       </div>
     )}

     <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
       <div className="space-y-4">
         <Label htmlFor="name">Name</Label>
         <Input id="name" value={formData.name} onChange={handleInputChange} />
         {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}

         <Label htmlFor="address">Address</Label>
         <Input id="address" value={formData.address} onChange={handleInputChange} />
         {errors.address && <p className="text-red-600 text-sm">{errors.address}</p>}

         <Label htmlFor="city">City</Label>
         <Input id="city" value={formData.city} onChange={handleInputChange} />
         {errors.city && <p className="text-red-600 text-sm">{errors.city}</p>}

         <Label htmlFor="state">State</Label>
         <Input id="state" value={formData.state} onChange={handleInputChange} />
         {errors.state && <p className="text-red-600 text-sm">{errors.state}</p>}

         <Label htmlFor="zip">Zip Code</Label>
         <Input id="zip" value={formData.zip} onChange={handleInputChange} />
         {errors.zip && <p className="text-red-600 text-sm">{errors.zip}</p>}

         <Label htmlFor="country">Country</Label>
         <Select id="country" onValueChange={(value) => handleSelectChange('country', value)}>
           <SelectTrigger>
             <SelectValue placeholder="Select a country" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="in">India</SelectItem>
             <SelectItem value="us">United States</SelectItem>
             <SelectItem value="ca">Canada</SelectItem>
             <SelectItem value="mx">Mexico</SelectItem>
             <SelectItem value="gb">United Kingdom</SelectItem>
             <SelectItem value="au">Australia</SelectItem>
             <SelectItem value="de">Germany</SelectItem>
             <SelectItem value="fr">France</SelectItem>
           </SelectContent>
         </Select>
         {errors.country && <p className="text-red-600 text-sm">{errors.country}</p>}

         <Label htmlFor="countryCode">Country Code</Label>
         <Input id="countryCode" value={formData.countryCode} readOnly />
         {errors.countryCode && <p className="text-red-600 text-sm">{errors.countryCode}</p>}

         <Label htmlFor="contact">Contact Number</Label>
         <Input id="contact" value={formData.contact} onChange={handleInputChange} />
         {errors.contact && <p className="text-red-600 text-sm">{errors.contact}</p>}
       </div>

       <Button type="submit">Proceed to Payment</Button>
       {paymentStatus && <p className="text-red-600 text-sm">{paymentStatus}</p>}
     </form>
   </div>
 </div>
);
}
