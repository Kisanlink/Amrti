import React, { useState } from "react";
import { Typography, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import "./CreateProductForm.css";

const CreateReport = () => {
  const [productData, setProductData] = useState({
    batchNo: "",
    productId: "",
    productReport: "",
    quantity: 0,
    type: "", // New field for pouch/tin selection
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let apiUrl;
      if (productData.type === "pouch") {
        apiUrl = `https://amrti-main-backend.vercel.app/api/v1/amrti/products/addbatch/${productData.productId}/powder`;
      } else if (productData.type === "tin") {
        apiUrl = `https://amrti-main-backend.vercel.app/api/v1/amrti/products/addbatch/${productData.productId}/powder`;
      } else {
        throw new Error("Please select a product type (pouch or tin)");
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });


      if (!response.ok) {
        throw new Error('Failed to create report');
      }

      const result = await response.json();
      console.log('Report created:', result);
      
      // Clear form after successful submission
      setProductData({
        batchNo: "",
        productId: "",
        productReport: "",
        quantity: 0,
        type: "",
      });

      setSuccess(true);
    } catch (error) {
      console.error("Failed to create report:", error);
      setError(error.message || "Failed to create report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="createProductContainer">
      <Typography
        variant="h3"
        sx={{ textAlign: "center" }}
        className="py-10 text-center"
      >
        Add New Report
      </Typography>
      <form
        onSubmit={handleSubmit}
        className="createProductContainer min-h-screen"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="BatchName"
              name="batchNo"
              value={productData.batchNo}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Product Id"
              name="productId"
              value={productData.productId}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Product Report"
              name="productReport"
              value={productData.productReport}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              name="quantity"
              value={productData.quantity}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="type-select-label">Type</InputLabel>
              <Select
                labelId="type-select-label"
                id="type-select"
                value={productData.type}
                label="Type"
                name="type"
                onChange={handleChange}
              >
                <MenuItem value="pouch">Pouch</MenuItem>
                <MenuItem value="tin">Tin</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              sx={{ p: 1.8 }}
              className="py-20"
              size="large"
              type="submit"
              disabled={loading}
            >
              {loading ? "Adding Report..." : "Add Report"}
            </Button>
          </Grid>
          
          {error && (
            <Grid item xs={12}>
              <Typography color="error">{error}</Typography>
            </Grid>
          )}

          {success && (
            <Grid item xs={12}>
              <Typography color="success">Report successfully created!</Typography>
            </Grid>
          )}
        </Grid>
      </form>
    </div>
  );
};

export default CreateReport;