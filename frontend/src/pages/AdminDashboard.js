import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  InputAdornment,
  IconButton,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FolderIcon from '@mui/icons-material/Folder';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'https://acadxpert-main.onrender.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Course options from the Admission model
const COURSES = ['MCA', 'MBA', 'MTech'];

// Semester options from the Admission model (1 to 4)
const SEMESTERS = Array.from({ length: 4 }, (_, i) => i + 1);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admissions, setAdmissions] = useState([]);
  const [filteredAdmissions, setFilteredAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCredentialsDialog, setOpenCredentialsDialog] = useState(false);
  const [credentials, setCredentials] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [stats, setStats] = useState({
    total: 0
  });
  const [activeTab, setActiveTab] = useState('details');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  useEffect(() => {
    fetchAdmissions();
  }, []);

  // Effect for filtering
  useEffect(() => {
    filterAdmissions();
  }, [searchQuery, selectedCourse, selectedSemester, admissions]);

  const filterAdmissions = () => {
    let filtered = [...admissions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(admission => 
        admission.name?.toLowerCase().includes(query) ||
        admission.email?.toLowerCase().includes(query)
      );
    }

    if (selectedCourse) {
      filtered = filtered.filter(admission => 
        admission.course === selectedCourse
      );
    }

    if (selectedSemester) {
      filtered = filtered.filter(admission => 
        admission.semester === selectedSemester
      );
    }

    setFilteredAdmissions(filtered);
    setStats({
      total: filtered.length
    });
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCourseChange = (event) => {
    setSelectedCourse(event.target.value);
  };

  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCourse('');
    setSelectedSemester('');
  };

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/admissions');
      const admissionsData = response.data?.data || [];
      setAdmissions(admissionsData);
      setStats({ total: admissionsData.length });
      setError(null);
    } catch (err) {
      console.error('Error fetching admissions:', err);
      setError('Failed to fetch admissions. Please try again later.');
      setAdmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (admission) => {
    setSelectedAdmission(admission);
    setOpenDialog(true);
  };

  const handleUpdateCredentials = async () => {
    if (credentials.newPassword !== credentials.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await api.post('/admin/update-credentials', {
        currentPassword: credentials.currentPassword,
        newPassword: credentials.newPassword,
      });
      setOpenCredentialsDialog(false);
      setCredentials({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setError(null);
    } catch (err) {
      setError('Failed to update credentials. Please check your current password.');
      console.error('Error updating credentials:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const formatDate = (dateObj) => {
    if (!dateObj) return 'Not provided';
    return `${dateObj.day}/${dateObj.month}/${dateObj.year}`;
  };

  const DocumentLink = ({ url, label }) => {
    if (!url) return <Typography color="error">Not uploaded</Typography>;
    
    const handleDownload = async () => {
      try {
        // Extract just the filename from the path
        const filename = url.split('/').pop();
        if (!filename) {
          throw new Error('Invalid file path');
        }

        // Get the authentication token
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Create the download URL with the filename and token
        const downloadUrl = `${api.defaults.baseURL}/uploads/${filename}?token=${token}`;
        
        console.log('Attempting to download from:', downloadUrl); // Debug log
        
        const response = await fetch(downloadUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('File not found on server');
          }
          throw new Error(`Server error: ${response.status}`);
        }
        
        // Get content type from response
        const contentType = response.headers.get('Content-Type');
        if (!contentType) {
          throw new Error('No content type specified by server');
        }

        const blob = await response.blob();
        if (blob.size === 0) {
          throw new Error('Downloaded file is empty');
        }

        // Create object URL for download
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        
        // Set filename based on content type if not specified
        const fileExtension = contentType.split('/').pop().replace('jpeg', 'jpg');
        const cleanLabel = label.toLowerCase().replace(/[^a-z0-9]/g, '_');
        link.download = `${cleanLabel}.${fileExtension}`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error('Error downloading document:', error);
        console.error('URL attempted:', url);
        alert(`Failed to download ${label}: ${error.message}`);
      }
    };

    return (
      <Button
        onClick={handleDownload}
        variant="contained"
        size="small"
        sx={{
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
            transform: 'translateY(-2px)',
            transition: 'transform 0.2s'
          },
          '&:disabled': {
            background: 'rgba(0, 0, 0, 0.12)',
            boxShadow: 'none'
          }
        }}
        startIcon={<DownloadIcon />}
      >
        Download {label}
      </Button>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600">
      {/* Navbar with enhanced styling */}
      <Box sx={{ 
        bgcolor: 'rgba(255, 255, 255, 0.15)', 
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        py: 2,
        px: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <Box display="flex" alignItems="center">
          <SchoolIcon sx={{ 
            fontSize: 40, 
            color: 'white',
            mr: 2,
            filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))'
          }} />
          <Typography variant="h5" sx={{ 
            color: 'white', 
            fontWeight: 600,
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
          }}>
            Admin Dashboard
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            onClick={() => setOpenCredentialsDialog(true)}
            sx={{ 
              mr: 2,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              '&:hover': { 
                bgcolor: 'rgba(255, 255, 255, 0.3)',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s'
              },
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
          >
            Update Credentials
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<ExitToAppIcon />}
            onClick={handleLogout}
            sx={{
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s'
              },
              boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)'
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              borderRadius: 2,
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
          >
            {error}
          </Alert>
        )}

        {/* Stats Card with enhanced styling */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              borderRadius: 4,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography 
                  color="textSecondary" 
                  gutterBottom
                  sx={{ 
                    fontSize: '1.2rem',
                    fontWeight: 500,
                    color: 'rgba(0,0,0,0.7)'
                  }}
                >
                  Total Applications
                </Typography>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters with enhanced styling */}
        <Paper sx={{ 
          p: 3, 
          mb: 3,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            alignItems="center"
            sx={{
              '& .MuiTextField-root, & .MuiFormControl-root': {
                background: 'rgba(255,255,255,0.9)',
                borderRadius: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }
            }}
          >
            <TextField
              label="Search by name or email"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ minWidth: 200 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Course</InputLabel>
              <Select
                value={selectedCourse}
                onChange={handleCourseChange}
                label="Course"
              >
                <MenuItem value="">All Courses</MenuItem>
                {COURSES.map((course) => (
                  <MenuItem key={course} value={course}>
                    {course}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Semester</InputLabel>
              <Select
                value={selectedSemester}
                onChange={handleSemesterChange}
                label="Semester"
              >
                <MenuItem value="">All Semesters</MenuItem>
                {SEMESTERS.map((semester) => (
                  <MenuItem key={semester} value={semester}>
                    Semester {semester}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={clearFilters}
              size="small"
            >
              Clear Filters
            </Button>
          </Stack>
        </Paper>

        {/* Applications Table with enhanced styling */}
        <TableContainer component={Paper} sx={{ 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.3)',
          overflow: 'hidden',
          '& .MuiTableHead-root': {
            background: 'rgba(33, 150, 243, 0.1)'
          },
          '& .MuiTableRow-root:hover': {
            background: 'rgba(33, 150, 243, 0.05)'
          }
        }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Course</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Semester</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '1rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={20} sx={{ my: 1 }} />
                  </TableCell>
                </TableRow>
              ) : filteredAdmissions.length > 0 ? (
                filteredAdmissions.map((admission) => (
                  <TableRow key={admission._id} hover>
                    <TableCell>{admission.name}</TableCell>
                    <TableCell>{admission.email}</TableCell>
                    <TableCell>{admission.course}</TableCell>
                    <TableCell>Semester {admission.semester}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetails(admission)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="textSecondary">No admissions found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Details Dialog with enhanced styling */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)} 
          maxWidth="lg" 
          fullWidth
          PaperProps={{
            sx: { 
              minHeight: '80vh',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.3)'
            }
          }}
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center">
                <AssignmentIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Application Details
                </Typography>
              </Box>
              <IconButton onClick={() => setOpenDialog(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent>
            {selectedAdmission && (
              <>
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
                >
                  <Tab
                    label="Student Information"
                    value="details"
                    icon={<PersonIcon />}
                    iconPosition="start"
                  />
                  <Tab
                    label="Documents"
                    value="documents"
                    icon={<FolderIcon />}
                    iconPosition="start"
                  />
                </Tabs>

                {activeTab === 'details' ? (
                  <Box>
                    {/* Course Information */}
                    <Typography variant="h6" gutterBottom sx={{ bgcolor: 'primary.main', color: 'white', p: 1, borderRadius: 1 }}>
                      Course Information
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} md={4}>
                        <Typography><strong>Course:</strong> {selectedAdmission.course}</Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography><strong>Semester:</strong> {selectedAdmission.semester}</Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography><strong>NIMCET Rank:</strong> {selectedAdmission.nimcetRank || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography><strong>CAT Rank:</strong> {selectedAdmission.catRank || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography><strong>GATE Rank:</strong> {selectedAdmission.gateRank || 'N/A'}</Typography>
                      </Grid>
                    </Grid>

                    {/* Personal Information */}
                    <Typography variant="h6" gutterBottom sx={{ bgcolor: 'primary.main', color: 'white', p: 1, borderRadius: 1 }}>
                      Personal Information
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} md={6}>
                        <Typography><strong>Name (English):</strong> {selectedAdmission.nameEnglish}</Typography>
                        <Typography><strong>Name (Hindi):</strong> {selectedAdmission.nameHindi || 'Not provided'}</Typography>
                        <Typography><strong>Email:</strong> {selectedAdmission.email}</Typography>
                        <Typography><strong>Mobile:</strong> {selectedAdmission.mobileNumber}</Typography>
                        <Typography><strong>Date of Birth:</strong> {formatDate(selectedAdmission.dateOfBirth)}</Typography>
                        <Typography><strong>Category:</strong> {selectedAdmission.category || 'Not provided'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography><strong>Permanent Address:</strong> {selectedAdmission.permanentAddress}</Typography>
                        <Typography><strong>State:</strong> {selectedAdmission.state}</Typography>
                        <Typography><strong>District:</strong> {selectedAdmission.district}</Typography>
                        <Typography><strong>Pin Code:</strong> {selectedAdmission.pinCode}</Typography>
                        <Typography><strong>Correspondence Address:</strong> {selectedAdmission.correspondenceAddress}</Typography>
                        <Typography><strong>Correspondence Email:</strong> {selectedAdmission.correspondenceEmail}</Typography>
                      </Grid>
                    </Grid>

                    {/* Parents Information */}
                    <Typography variant="h6" gutterBottom sx={{ bgcolor: 'primary.main', color: 'white', p: 1, borderRadius: 1 }}>
                      Parents Information
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom><strong>Father's Details</strong></Typography>
                        <Typography><strong>Name (English):</strong> {selectedAdmission.fatherNameEnglish || 'Not provided'}</Typography>
                        <Typography><strong>Name (Hindi):</strong> {selectedAdmission.fatherNameHindi || 'Not provided'}</Typography>
                        <Typography><strong>Occupation:</strong> {selectedAdmission.fatherOccupation || 'Not provided'}</Typography>
                        <Typography><strong>Office Address:</strong> {selectedAdmission.fatherOfficeAddress || 'Not provided'}</Typography>
                        <Typography><strong>Email:</strong> {selectedAdmission.fatherEmail || 'Not provided'}</Typography>
                        <Typography><strong>Phone:</strong> {selectedAdmission.fatherPhone || 'Not provided'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom><strong>Mother's Details</strong></Typography>
                        <Typography><strong>Name (English):</strong> {selectedAdmission.motherNameEnglish || 'Not provided'}</Typography>
                        <Typography><strong>Name (Hindi):</strong> {selectedAdmission.motherNameHindi || 'Not provided'}</Typography>
                        <Typography><strong>Occupation:</strong> {selectedAdmission.motherOccupation || 'Not provided'}</Typography>
                        <Typography><strong>Office Address:</strong> {selectedAdmission.motherOfficeAddress || 'Not provided'}</Typography>
                        <Typography><strong>Email:</strong> {selectedAdmission.motherEmail || 'Not provided'}</Typography>
                        <Typography><strong>Phone:</strong> {selectedAdmission.motherPhone || 'Not provided'}</Typography>
                      </Grid>
                    </Grid>

                    {/* Remarks */}
                    {selectedAdmission.remarks && (
                      <>
                        <Typography variant="h6" gutterBottom sx={{ bgcolor: 'primary.main', color: 'white', p: 1, borderRadius: 1, mt: 3 }}>
                          Remarks
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                          <Typography>{selectedAdmission.remarks}</Typography>
                        </Paper>
                      </>
                    )}
                  </Box>
                ) : (
                  <Box>
                    {/* Documents */}
                    <Typography variant="h6" gutterBottom sx={{ bgcolor: 'primary.main', color: 'white', p: 1, borderRadius: 1 }}>
                      Documents Status Overview
                    </Typography>

                    {/* Pending Documents and Undertaking Status */}
                    <Paper sx={{ 
                      p: 3, 
                      mb: 3, 
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      borderRadius: 2,
                      border: '1px solid rgba(33, 150, 243, 0.1)'
                    }}>
                      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                        Pending Documents Status
                      </Typography>
                      
                      {Object.entries(selectedAdmission.documentStatus || {}).some(([_, status]) => status.pending) ? (
                        <>
                          <Alert 
                            severity="warning" 
                            sx={{ mb: 2 }}
                          >
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                The following documents are pending:
                              </Typography>
                              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                {Object.entries(selectedAdmission.documentStatus || {})
                                  .filter(([_, status]) => status.pending)
                                  .map(([doc]) => (
                                    <Box component="li" key={doc} sx={{ fontSize: '0.875rem' }}>
                                      {doc.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </Box>
                                  ))
                                }
                              </Box>
                            </Box>
                          </Alert>

                          {selectedAdmission.undertakingText ? (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                                Student's Undertaking:
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                fontStyle: 'italic',
                                bgcolor: 'rgba(255, 244, 229, 0.5)',
                                p: 2,
                                borderRadius: 1,
                                border: '1px solid rgba(255, 167, 38, 0.2)'
                              }}>
                                "{selectedAdmission.undertakingText}"
                              </Typography>
                            </Box>
                          ) : (
                            <Alert severity="info" sx={{ mt: 2 }}>
                              No undertaking provided for pending documents.
                            </Alert>
                          )}
                        </>
                      ) : (
                        <Alert severity="success">
                          All required documents have been submitted.
                        </Alert>
                      )}
                    </Paper>

                    {/* Rest of the documents sections */}
                    <Typography variant="h6" gutterBottom sx={{ bgcolor: 'primary.main', color: 'white', p: 1, borderRadius: 1 }}>
                      Documents
                    </Typography>
                    <Grid container spacing={3}>
                      {/* Personal Documents Section */}
                      <Grid item xs={12}>
                        <Paper sx={{ 
                          p: 3, 
                          mb: 3, 
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                          borderRadius: 2,
                          border: '1px solid rgba(33, 150, 243, 0.1)'
                        }}>
                          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                            Personal Documents
                          </Typography>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Box sx={{ 
                                p: 2, 
                                border: '1px solid rgba(0,0,0,0.1)', 
                                borderRadius: 1,
                                bgcolor: 'rgba(255,255,255,0.5)',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateY(-2px)' }
                              }}>
                                <Typography variant="subtitle2" gutterBottom>Photo:</Typography>
                                <DocumentLink url={selectedAdmission.photo} label="Photo" />
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Box sx={{ 
                                p: 2, 
                                border: '1px solid rgba(0,0,0,0.1)', 
                                borderRadius: 1,
                                bgcolor: 'rgba(255,255,255,0.5)',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateY(-2px)' }
                              }}>
                                <Typography variant="subtitle2" gutterBottom>Signature:</Typography>
                                <DocumentLink url={selectedAdmission.signature} label="Signature" />
                              </Box>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>

                      {/* Educational Documents Section */}
                      <Grid item xs={12}>
                        <Paper sx={{ 
                          p: 3, 
                          mb: 3, 
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                          borderRadius: 2,
                          border: '1px solid rgba(33, 150, 243, 0.1)'
                        }}>
                          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                            Educational Documents
                          </Typography>
                          <Grid container spacing={3}>
                            {[
                              { label: '10th Marksheet', url: selectedAdmission.marksheet10th },
                              { label: '10th Certificate', url: selectedAdmission.certificate10th },
                              { label: '12th Marksheet', url: selectedAdmission.marksheet12th },
                              { label: '12th Certificate', url: selectedAdmission.certificate12th },
                              { label: 'Graduation Marksheet', url: selectedAdmission.graduationMarksheet }
                            ].map((doc, index) => (
                              <Grid item xs={12} md={4} key={index}>
                                <Box sx={{ 
                                  p: 2, 
                                  border: '1px solid rgba(0,0,0,0.1)', 
                                  borderRadius: 1,
                                  bgcolor: 'rgba(255,255,255,0.5)',
                                  transition: 'transform 0.2s',
                                  '&:hover': { transform: 'translateY(-2px)' }
                                }}>
                                  <Typography variant="subtitle2" gutterBottom>{doc.label}:</Typography>
                                  <DocumentLink url={doc.url} label={doc.label} />
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </Paper>
                      </Grid>

                      {/* Entrance Exam Documents Section */}
                      <Grid item xs={12}>
                        <Paper sx={{ 
                          p: 3, 
                          mb: 3, 
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                          borderRadius: 2,
                          border: '1px solid rgba(33, 150, 243, 0.1)'
                        }}>
                          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                            Entrance Exam Documents
                          </Typography>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Box sx={{ 
                                p: 2, 
                                border: '1px solid rgba(0,0,0,0.1)', 
                                borderRadius: 1,
                                bgcolor: 'rgba(255,255,255,0.5)',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateY(-2px)' }
                              }}>
                                <Typography variant="subtitle2" gutterBottom>Admit Card:</Typography>
                                <DocumentLink url={selectedAdmission.entranceAdmitCard} label="Admit Card" />
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Box sx={{ 
                                p: 2, 
                                border: '1px solid rgba(0,0,0,0.1)', 
                                borderRadius: 1,
                                bgcolor: 'rgba(255,255,255,0.5)',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateY(-2px)' }
                              }}>
                                <Typography variant="subtitle2" gutterBottom>Score Card:</Typography>
                                <DocumentLink url={selectedAdmission.entranceScoreCard} label="Score Card" />
                              </Box>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>

                      {/* Other Documents Section */}
                      <Grid item xs={12}>
                        <Paper sx={{ 
                          p: 3, 
                          mb: 3, 
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                          borderRadius: 2,
                          border: '1px solid rgba(33, 150, 243, 0.1)'
                        }}>
                          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                            Other Documents
                          </Typography>
                          <Grid container spacing={3}>
                            {[
                              { label: 'Provisional Certificate', url: selectedAdmission.provisionalCertificate },
                              { label: 'Character Certificate', url: selectedAdmission.characterCertificate },
                              { label: 'Medical Certificate', url: selectedAdmission.medicalCertificate },
                              { label: 'Category Certificate', url: selectedAdmission.categoryCertificate },
                              { label: 'Defence Certificate', url: selectedAdmission.defenceCertificate },
                              { label: 'Aadhaar Card', url: selectedAdmission.aadhaarCard },
                              { label: 'PAN Card', url: selectedAdmission.panCard }
                            ].map((doc, index) => (
                              <Grid item xs={12} md={4} key={index}>
                                <Box sx={{ 
                                  p: 2, 
                                  border: '1px solid rgba(0,0,0,0.1)', 
                                  borderRadius: 1,
                                  bgcolor: 'rgba(255,255,255,0.5)',
                                  transition: 'transform 0.2s',
                                  '&:hover': { transform: 'translateY(-2px)' }
                                }}>
                                  <Typography variant="subtitle2" gutterBottom>{doc.label}:</Typography>
                                  <DocumentLink url={doc.url} label={doc.label} />
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Credentials Dialog with enhanced styling */}
        <Dialog 
          open={openCredentialsDialog} 
          onClose={() => setOpenCredentialsDialog(false)}
          PaperProps={{
            sx: { 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.3)'
            }
          }}
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Update Admin Credentials</Typography>
              <IconButton onClick={() => setOpenCredentialsDialog(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <TextField
              margin="dense"
              label="Current Password"
              type="password"
              fullWidth
              value={credentials.currentPassword}
              onChange={(e) => setCredentials({ ...credentials, currentPassword: e.target.value })}
            />
            <TextField
              margin="dense"
              label="New Password"
              type="password"
              fullWidth
              value={credentials.newPassword}
              onChange={(e) => setCredentials({ ...credentials, newPassword: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Confirm New Password"
              type="password"
              fullWidth
              value={credentials.confirmPassword}
              onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenCredentialsDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateCredentials} variant="contained" color="primary">
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
};

export default AdminDashboard;