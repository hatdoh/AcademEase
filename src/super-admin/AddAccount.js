import React, { useState } from 'react';
import { addAccount } from '../utils/Authentication';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  TextField,
  Button,
  Grid,
  Container,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

function AddAccount() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check if screen size is mobile
  const [account, setAccount] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    middleName: '',
    dob: '',
    gender: '',
    phoneNumber: ''
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAccount(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSave = async () => {
    if (!/^09\d{9}$/.test(account.phoneNumber)) {
      Swal.fire({
        title: 'Error',
        text: "Phone number must be exactly 11 digits and start with '09'.",
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    if (account.password !== account.confirmPassword) {
      Swal.fire({
        title: 'Error',
        text: "Password and confirm password do not match.",
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    if (!validatePassword(account.password)) {
      Swal.fire({
        title: 'Error',
        text: "Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one symbol.",
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to save this account?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'No, cancel!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await addAccount({
            email: account.email,
            password: account.password,
            firstName: account.firstName,
            lastName: account.lastName,
            middleName: account.middleName,
            dob: account.dob,
            gender: account.gender,
            phoneNumber: account.phoneNumber
          });

          Swal.fire({
            title: 'Success',
            text: "Account created successfully!",
            icon: 'success',
            confirmButtonColor: '#3085d6'
          }).then(() => {
            navigate('/');
          });
        } catch (error) {
          console.error('Failed to create account:', error.message);
          Swal.fire({
            title: 'Error',
            text: error.message,
            icon: 'error',
            confirmButtonColor: '#3085d6'
          });
        }
      } else {
        Swal.fire({
          title: 'Cancelled',
          text: "Account creation was cancelled.",
          icon: 'info',
          confirmButtonColor: '#3085d6'
        });
      }
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: isMobile ? 8 : 4, ml: isMobile ? 0 : 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Add Account
      </Typography>
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12} md={4}>
          <TextField
            label="Last Name"
            name="lastName"
            value={account.lastName}
            onChange={handleInputChange}
            fullWidth
            sx={{
              backgroundColor: 'white',
              borderRadius: 2
            }}
            InputProps={{
              sx: {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#818181'
                }
              }
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="First Name"
            name="firstName"
            value={account.firstName}
            onChange={handleInputChange}
            fullWidth
            sx={{
              backgroundColor: 'white',
              borderRadius: 2
            }}
            InputProps={{
              sx: {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#818181'
                }
              }
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Middle Name"
            name="middleName"
            value={account.middleName}
            onChange={handleInputChange}
            fullWidth
            sx={{
              backgroundColor: 'white',
              borderRadius: 2
            }}
            InputProps={{
              sx: {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#818181'
                }
              }
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Date of Birth"
            name="dob"
            value={account.dob}
            onChange={handleInputChange}
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{
              backgroundColor: 'white',
              borderRadius: 2
            }}
            InputProps={{
              sx: {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#818181'
                }
              }
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth
            sx={{
              backgroundColor: 'white',
              borderRadius: 2
            }}>
            <InputLabel>Gender</InputLabel>
            <Select
              name="gender"
              value={account.gender}
              onChange={handleInputChange}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#818181',
                },
              }}
            >
              <MenuItem value=""><em>Select Gender</em></MenuItem>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Email"
            name="email"
            value={account.email}
            onChange={handleInputChange}
            fullWidth
            sx={{
              backgroundColor: 'white',
              borderRadius: 2
            }}
            InputProps={{
              sx: {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#818181'
                }
              }
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Phone Number"
            name="phoneNumber"
            value={account.phoneNumber}
            onChange={handleInputChange}
            fullWidth
            inputProps={{ maxLength: 11 }}
            sx={{
              backgroundColor: 'white',
              borderRadius: 2
            }}
            InputProps={{
              sx: {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#818181'
                }
              }
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Password"
            name="password"
            value={account.password}
            onChange={handleInputChange}
            type="password"
            fullWidth
            sx={{
              backgroundColor: 'white',
              borderRadius: 2
            }}
            InputProps={{
              sx: {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#818181'
                }
              }
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Confirm Password"
            name="confirmPassword"
            value={account.confirmPassword}
            onChange={handleInputChange}
            type="password"
            fullWidth
            sx={{
              backgroundColor: 'white',
              borderRadius: 2
            }}
            InputProps={{
              sx: {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#818181'
                }
              }
            }}
          />
        </Grid>
        <Grid item xs={12} display="flex" justifyContent='flex-start' sx={{ mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            sx={{ mr: 2 }}
          >
            Save
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AddAccount;
