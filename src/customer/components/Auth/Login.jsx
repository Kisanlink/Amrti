import * as React from "react";
import { Grid, TextField, Button, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function ForgotPasswordDialog({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackBarSeverity, setSnackBarSeverity] = useState("success");
  const [openSnackBar, setOpenSnackBar] = useState(false);

  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (step === 1) {
      // Generate OTP
      try {
        const response = await fetch('https://amrti-main-backend.vercel.app/api/v1/amrti/users/resetPassword', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        if (response.ok) {
          setStep(2);
          setSnackBarMessage("OTP sent successfully");
          setSnackBarSeverity("success");
          setOpenSnackBar(true);
        } else {
          throw new Error('Failed to generate OTP');
        }
      } catch (error) {
        console.error('Error generating OTP:', error);
        setSnackBarMessage("Failed to generate OTP");
        setSnackBarSeverity("error");
        setOpenSnackBar(true);
      }
    } else if (step === 2) {
      // Verify OTP and reset password
      if (newPassword !== confirmPassword) {
        setSnackBarMessage("Passwords don't match");
        setSnackBarSeverity("error");
        setOpenSnackBar(true);
        return;
      }
      try {
        const response = await fetch('https://amrti-main-backend.vercel.app/api/v1/amrti/users/verifyOtppassword', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ passwordResetOtp: otp, password: newPassword, passwordConfirm: confirmPassword }),
        });
        if (response.ok) {
          setSnackBarMessage('Password reset successfully');
          setSnackBarSeverity("success");
          setOpenSnackBar(true);
          setTimeout(() => {
            onClose();
          }, 2000);
        } else if (response.status === 400) {
          setSnackBarMessage("Invalid OTP");
          setSnackBarSeverity("error");
          setOpenSnackBar(true);
        } else {
          throw new Error('Failed to verify OTP or reset password');
        }
      } catch (error) {
        console.error('Error verifying OTP or resetting password:', error);
        setSnackBarMessage("Error resetting password");
        setSnackBarSeverity("error");
        setOpenSnackBar(true);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{step === 1 ? "Forgot Password" : "Reset Password"}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {step === 1 ? (
            <TextField
              autoFocus
              margin="dense"
              id="email"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          ) : (
            <>
              <TextField
                margin="dense"
                id="otp"
                label="OTP"
                type="text"
                fullWidth
                variant="outlined"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <TextField
                margin="dense"
                id="newPassword"
                label="New Password"
                type="password"
                fullWidth
                variant="outlined"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <TextField
                margin="dense"
                id="confirmPassword"
                label="Confirm New Password"
                type="password"
                fullWidth
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit">{step === 1 ? "Send OTP" : "Reset Password"}</Button>
        </DialogActions>
      </form>
      <Snackbar
        open={openSnackBar}
        autoHideDuration={6000}
        onClose={handleCloseSnackBar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackBar}
          severity={snackBarSeverity}
          sx={{ width: "100%" }}
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

export default function LoginUserForm() {
  const navigate = useNavigate();
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackBarSeverity, setSnackBarSeverity] = useState("success");
  const [openForgotPassword, setOpenForgotPassword] = useState(false);

  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const userData = {
      email: data.get("email"),
      password: data.get("password"),
    };

    try {
      const response = await fetch('https://amrti-main-backend.vercel.app/api/v1/amrti/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const result = await response.json();
      console.log(result)
      const token = result.token;
      

      if (token) {
        document.cookie = `jwtToken=${token}; path=/; secure; samesite=strict`;
        localStorage.setItem("jwt", token); // Save the token in local storage
        setSnackBarMessage("Login Success");
        setSnackBarSeverity("success");
        setOpenSnackBar(true);
        if(result.data.user.role==="admin"){
            navigate("/admin")
        }
        // Update the navbar here, for example by reloading the page
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      setSnackBarMessage(error.message);
      setSnackBarSeverity("error");
      setOpenSnackBar(true);
    }
  };

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      // Optionally, you can verify the JWT by making a backend call to get user info
    }
  }, []);

  return (
    <React.Fragment>
      <form className="w-full" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              id="email"
              name="email"
              label="Email"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              id="password"
              name="password"
              label="Password"
              fullWidth
              type="password"
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              className="bg-[#9155FD] w-full"
              type="submit"
              variant="contained"
              size="large"
              sx={{ padding: ".8rem 0" }}
            >
              Login
            </Button>
          </Grid>
        </Grid>
      </form>
      <div className="flex justify-center flex-col items-center">
        <div className="py-3 flex items-center">
          <p className="m-0 p-0">Don't have an account?</p>
          <Button
            onClick={() => navigate("/register")}
            className="ml-5"
            size="small"
          >
            Register
          </Button>
        </div>
        <Button
          onClick={() => setOpenForgotPassword(true)}
          className="mt-2"
          size="small"
        >
          Forgot Password?
        </Button>
      </div>
      <Snackbar
        open={openSnackBar}
        autoHideDuration={6000}
        onClose={handleCloseSnackBar}
      >
        <Alert
          onClose={handleCloseSnackBar}
          severity={snackBarSeverity}
          sx={{ width: "100%" }}
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>
      <ForgotPasswordDialog
        open={openForgotPassword}
        onClose={() => setOpenForgotPassword(false)}
      />
    </React.Fragment>
  );
}