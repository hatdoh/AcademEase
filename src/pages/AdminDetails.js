import React, { useState, useEffect } from 'react';
import { getAdminDetails, updateAdminDetails, logout, getCurrentUser, updatePassword } from '../utils/Authentication';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { auth } from '../config/firebase';
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

function AdminDetails() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check if screen size is mobile
  const [admin, setAdmin] = useState({
    uid: '',
    email: '',
    lastName: '',
    firstName: '',
    middleName: '',
    dob: '',
    gender: '',
    phoneNumber: ''
  });
  const [formerPassword, setFormerPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const currentUser = getCurrentUser();
        if (currentUser) {
          const adminDetails = await getAdminDetails(currentUser.uid);
          setAdmin({
            uid: currentUser.uid,
            email: adminDetails.email,
            lastName: adminDetails.lastName || '',
            firstName: adminDetails.firstName || '',
            middleName: adminDetails.middleName || '',
            dob: adminDetails.dob || '',
            gender: adminDetails.gender || '',
            phoneNumber: adminDetails.phoneNumber || ''
          });
        }
      } catch (error) {
        console.error('Failed to fetch admin details:', error.message);
      }
    };

    fetchAdminData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdmin(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSave = async () => {
    if (!/^09\d{9}$/.test(admin.phoneNumber)) {
      Swal.fire({
        title: 'Error',
        text: "Phone number must be exactly 11 digits and start with '09'.",
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        title: 'Error',
        text: "New password and confirm password do not match.",
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    if (newPassword && !validatePassword(newPassword)) {
      Swal.fire({
        title: 'Error',
        text: "Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one symbol.",
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    try {
      await updateAdminDetails(admin.uid, {
        firstName: admin.firstName,
        lastName: admin.lastName,
        middleName: admin.middleName,
        dob: admin.dob,
        gender: admin.gender,
        phoneNumber: admin.phoneNumber
      });

      if (formerPassword && newPassword) {
        await updatePassword(auth.currentUser, formerPassword, newPassword);

        Swal.fire({
          title: 'Saved',
          text: "Details and password updated successfully!",
          icon: 'success',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          navigate('/login');
        });
      } else {
        Swal.fire({
          title: 'Saved',
          text: "Details updated successfully!",
          icon: 'success',
          confirmButtonColor: '#3085d6'
        });
      }
    } catch (error) {
      console.error('Failed to update admin details:', error.message);
      Swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/login');
      }
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: isMobile ? 8 : 4, ml: isMobile ? 0 : 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Admin Details
      </Typography>
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12} md={4}>
          <TextField
            label="Last Name"
            name="lastName"
            value={admin.lastName}
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
            value={admin.firstName}
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
            value={admin.middleName}
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
        <Grid item xs={12}>
          <TextField
            label="Email"
            name="email"
            value={admin.email}
            onChange={handleInputChange}
            fullWidth
            disabled
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
            value={admin.dob}
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
              value={admin.gender}
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
        <Grid item xs={12} md={4}>
          <TextField
            label="Phone Number"
            name="phoneNumber"
            value={admin.phoneNumber}
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
        <Grid item xs={12} md={4}>
          <TextField
            label="Old Password"
            name="formerPassword"
            value={formerPassword}
            onChange={(e) => setFormerPassword(e.target.value)}
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
        <Grid item xs={12} md={4}>
          <TextField
            label="New Password"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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
        <Grid item xs={12} md={4}>
          <TextField
            label="Repeat Password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          <Button
            variant="contained"
            color="secondary"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AdminDetails;
