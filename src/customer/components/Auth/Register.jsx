import { Grid, TextField, Button, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function RegisterUserForm() {
  const navigate = useNavigate();
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackBarSeverity, setSnackBarSeverity] = useState("success");
  const [errors, setErrors] = useState({});
  const [showOtpField, setShowOtpField] = useState(false);
  const [otp, setOtp] = useState("");
  const [userData, setUserData] = useState({});

  const handleClose = () => setOpenSnackBar(false);

  const validateForm = (data) => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[a-zA-Z\s]+$/;

    if (!nameRegex.test(data.name)) {
      newErrors.name = "Name should not contain special symbols";
    }
    if (!emailRegex.test(data.email)) {
      newErrors.email = "Invalid email format";
    }
    if (data.password.length < 8) {
      newErrors.password = "Password should be minimum 8 characters";
    }
    if (data.password !== data.passwordConfirm) {
      newErrors.passwordConfirm = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const formData = {
      name: data.get("name"),
      email: data.get("email"),
      password: data.get("password"),
      passwordConfirm: data.get("passwordConfirm"),
    };

    if (!validateForm(formData)) {
      return;
    }

    setUserData(formData);
    await sendOtp(formData.email,formData.name,formData.password,formData.passwordConfirm);
  };

  const sendOtp = async (email,name,password,passwordConfirm) => {
    try {
      const response = await fetch("https://amrti-main-backend.vercel.app/api/v1/amrti/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email,name,password,passwordConfirm }),
      });

      const result = await response.json();
      console.log(result)

      if (response.ok) {
        setSnackBarMessage("OTP sent successfully. Please check your email.");
        setSnackBarSeverity("success");
        setShowOtpField(true);
      } else if(response.status===400){
         setSnackBarMessage("Already Registered!");

      }
      
      
      else {
        setSnackBarMessage(result.error || "Failed to send OTP");
        setSnackBarSeverity("error");
      }
    } catch (error) {
      setSnackBarMessage("An error occurred while sending OTP");
      setSnackBarSeverity("error");
    }

    setOpenSnackBar(true);
  };

  const verifyOtpAndRegister = async () => {
    try {
      const verifyResponse = await fetch("https://amrti-main-backend.vercel.app/api/v1/amrti/users/verifyOtp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp: otp }),
      });

      const verifyResult = await verifyResponse.json();
      console.log(verifyResponse);
      console.log(verifyResult);

      if (verifyResponse.ok) {
        setSnackBarMessage("Registration successful!");
        setSnackBarSeverity("success");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        // Convert the error object to a string if it's not already
        const errorMessage = typeof verifyResult.error === 'object' 
          ? JSON.stringify(verifyResult.error) 
          : verifyResult.error || "OTP verification failed";
        setSnackBarMessage(errorMessage);
        setSnackBarSeverity("error");
      }
    } catch (error) {
      setSnackBarMessage("An error occurred during registration");
      setSnackBarSeverity("error");
    }

    setOpenSnackBar(true);
  };

  return (
    <div className="">
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              id="name"
              name="name"
              label="Name"
              fullWidth
              autoComplete="name"
              error={!!errors.name}
              helperText={errors.name}
              disabled={showOtpField}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              id="email"
              name="email"
              label="Email"
              fullWidth
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email}
              disabled={showOtpField}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              id="password"
              name="password"
              label="Password"
              fullWidth
              autoComplete="new-password"
              type="password"
              error={!!errors.password}
              helperText={errors.password}
              disabled={showOtpField}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              id="passwordConfirm"
              name="passwordConfirm"
              label="Confirm Password"
              fullWidth
              autoComplete="new-password"
              type="password"
              error={!!errors.passwordConfirm}
              helperText={errors.passwordConfirm}
              disabled={showOtpField}
            />
          </Grid>
          {showOtpField && (
            <Grid item xs={12}>
              <TextField
                required
                id="otp"
                name="otp"
                label="OTP"
                fullWidth
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <Button
              className="bg-[#9155FD] w-full"
              type={showOtpField ? "button" : "submit"}
              variant="contained"
              size="large"
              sx={{ padding: ".8rem 0" }}
              onClick={showOtpField ? verifyOtpAndRegister : undefined}
            >
              {showOtpField ? "Verify OTP and Register" : "Send OTP"}
            </Button>
          </Grid>
        </Grid>
      </form>

      <div className="flex justify-center flex-col items-center">
        <div className="py-3 flex items-center">
          <p className="m-0 p-0">Already have an account?</p>
          <Button
            onClick={() => navigate("/login")}
            className="ml-5"
            size="small"
          >
            Login
          </Button>
        </div>
      </div>

      <Snackbar
        open={openSnackBar}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity={snackBarSeverity} sx={{ width: "100%" }}>
          {snackBarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}