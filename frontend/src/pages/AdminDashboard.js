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
  baseURL: 'http://localhost:8000', // Changed to local backend
  headers: { 'Content-Type': 'application/json' },
});

// Add token to each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Course & Semester options
const COURSES = ['MCA', 'MBA', 'MTech'];
const SEMESTERS = [1, 2, 3, 4];

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Admissions state
  const [admissions, setAdmissions] = useState([]);
  const [filteredAdmissions, setFilteredAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialog & UI states
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCredentialsDialog, setOpenCredentialsDialog] = useState(false);
  const [credentials, setCredentials] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [stats, setStats] = useState({ total: 0 });
  const [activeTab, setActiveTab] = useState('details');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  // Circular upload states
  const [circularTitle, setCircularTitle] = useState('');
  const [circularFile, setCircularFile] = useState(null);
  const [circularCourse, setCircularCourse] = useState('');
  const [circularSemester, setCircularSemester] = useState('');
  const [uploadingCircular, setUploadingCircular] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  // Circular management states
  const [circulars, setCirculars] = useState([]);
  const [loadingCirculars, setLoadingCirculars] = useState(false);
  const [circularFilterCourse, setCircularFilterCourse] = useState('');
  const [circularFilterSemester, setCircularFilterSemester] = useState('');

  useEffect(() => {
    fetchAdmissions();
    fetchCirculars();
  }, []);

  useEffect(() => {
    filterAdmissions();
  }, [searchQuery, selectedCourse, selectedSemester, admissions]);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/admissions'); // GET all admissions
      const data = response.data?.data || [];
      setAdmissions(data);
      setStats({ total: data.length });
      setError(null);
    } catch (err) {
      console.error('Error fetching admissions:', err);
      setError('Failed to fetch admissions. Please try again later.');
      setAdmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCirculars = async () => {
    try {
      setLoadingCirculars(true);
      const params = {};
      if (circularFilterCourse) params.course = circularFilterCourse;
      if (circularFilterSemester) params.semester = circularFilterSemester;
      
      const response = await api.get('/admin/circulars', { params });
      const data = response.data?.data || [];
      setCirculars(data);
    } catch (err) {
      console.error('Error fetching circulars:', err);
      setCirculars([]);
    } finally {
      setLoadingCirculars(false);
    }
  };

  const filterAdmissions = () => {
    let filtered = [...admissions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) => a.name?.toLowerCase().includes(query) || a.email?.toLowerCase().includes(query)
      );
    }
    if (selectedCourse) filtered = filtered.filter((a) => a.course === selectedCourse);
    if (selectedSemester) filtered = filtered.filter((a) => a.semester === selectedSemester);

    setFilteredAdmissions(filtered);
    setStats({ total: filtered.length });
  };

  // Format date helper
  const formatDate = (dateObj) => {
    if (!dateObj) return 'Not provided';
    return `${dateObj.day}/${dateObj.month}/${dateObj.year}`;
  };

  // Document download button
  const DocumentLink = ({ url, label }) => {
    if (!url) return <Typography color="error">Not uploaded</Typography>;

    const handleDownload = async () => {
      try {
        const filename = url.split('/').pop();
        if (!filename) throw new Error('Invalid file path');

        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token not found');

        // If circulars are stored in uploads/circulars, adjust the path accordingly
        // For other documents, keep uploads/
        let downloadUrl;
        if (url.includes('circulars')) {
          downloadUrl = `${api.defaults.baseURL}/uploads/circulars/${filename}`;
        } else {
          downloadUrl = `${api.defaults.baseURL}/uploads/${filename}`;
        }

        const response = await fetch(downloadUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          if (response.status === 404) throw new Error('File not found on server');
          throw new Error(`Server error: ${response.status}`);
        }

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;

        // Guess extension from content-type
        const contentType = response.headers.get('Content-Type');
        let extension = 'pdf';
        if (contentType) {
          extension = contentType.split('/')[1] || 'pdf';
          if (extension === 'jpeg') extension = 'jpg';
        }

        link.download = `${label.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${extension}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error('Download error:', error);
        alert(`Failed to download ${label}: ${error.message}`);
      }
    };

    return (
      <Button
        onClick={handleDownload}
        variant="contained"
        size="small"
        startIcon={<DownloadIcon />}
        sx={{
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          '&:hover': {
            background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
            transform: 'translateY(-2px)',
            transition: 'transform 0.2s',
          },
          '&:disabled': { background: 'rgba(0,0,0,0.12)', boxShadow: 'none' },
        }}
      >
        Download {label}
      </Button>
    );
  };

  // Circular upload handler
  const handleUploadCircular = async () => {
    if (!circularTitle || !circularFile || !circularCourse || !circularSemester) return;
    setUploadingCircular(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.append('title', circularTitle);
      formData.append('pdf', circularFile);
      formData.append('course', circularCourse);
      formData.append('semester', circularSemester);

      const response = await api.post('/admin/circulars', formData, { // POST circular
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        setUploadSuccess('Circular uploaded successfully');
        setCircularTitle('');
        setCircularFile(null);
        setCircularCourse('');
        setCircularSemester('');
        // Refresh circulars list
        fetchCirculars();
      } else {
        setUploadError('Failed to upload circular');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploadingCircular(false);
    }
  };

  // View admission details dialog controls
  const handleViewDetails = (admission) => {
    setSelectedAdmission(admission);
    setOpenDialog(true);
  };

  // Admin credentials update handler
  const handleUpdateCredentials = async () => {
    if (credentials.newPassword !== credentials.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await api.post('/admin/update-credentials', { // POST update credentials
        currentPassword: credentials.currentPassword,
        newPassword: credentials.newPassword,
      });
      setOpenCredentialsDialog(false);
      setCredentials({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setError(null);
      alert('Credentials updated successfully');
    } catch (err) {
      setError('Failed to update credentials. Please check your current password.');
      console.error('Error updating credentials:', err);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
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
      {/* Navbar */}
      <Box
        sx={{
          bgcolor: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.3)',
          py: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <Box display="flex" alignItems="center">
          <SchoolIcon
            sx={{
              fontSize: 40,
              color: 'white',
              mr: 2,
              filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))',
            }}
          />
          <Typography
            variant="h5"
            sx={{ color: 'white', fontWeight: 600, textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
          >
            Admin Dashboard
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            onClick={() => setOpenCredentialsDialog(true)}
            sx={{
              mr: 2,
              bgcolor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s',
              },
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
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
                transition: 'all 0.2s',
              },
              boxShadow: '0 3px 5px 2px rgba(255,105,135,.3)',
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
            sx={{ mb: 2, borderRadius: 2, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
          >
            {error}
          </Alert>
        )}

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  color="textSecondary"
                  gutterBottom
                  sx={{ fontSize: '1.2rem', fontWeight: 500, color: 'rgba(0,0,0,0.7)' }}
                >
                  Total Applications
                </Typography>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            sx={{
              '& .MuiTextField-root, & .MuiFormControl-root': {
                background: 'rgba(255,255,255,0.9)',
                borderRadius: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              },
            }}
          >
            <TextField
              label="Search by name or email"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              <Select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} label="Course">
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
                onChange={(e) => setSelectedSemester(e.target.value)}
                label="Semester"
              >
                <MenuItem value="">All Semesters</MenuItem>
                {SEMESTERS.map((sem) => (
                  <MenuItem key={sem} value={sem}>
                    Semester {sem}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="outlined" onClick={() => {
              setSearchQuery('');
              setSelectedCourse('');
              setSelectedSemester('');
            }} size="small">
              Clear Filters
            </Button>
          </Stack>
        </Paper>

        {/* Admin Upload Circular Form */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.5)',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Upload Circular (PDF)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                value={circularTitle}
                onChange={(e) => setCircularTitle(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 2, minWidth: '200px' }}>
                <InputLabel>Course</InputLabel>
                <Select 
                  value={circularCourse} 
                  onChange={(e) => setCircularCourse(e.target.value)} 
                  label="Course"
                >
                  {COURSES.map((course) => (
                    <MenuItem key={course} value={course}>
                      {course}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 2, minWidth: '200px' }}>
                <InputLabel>Semester</InputLabel>
                <Select 
                  value={circularSemester} 
                  onChange={(e) => setCircularSemester(e.target.value)} 
                  label="Semester"
                >
                  {SEMESTERS.map((sem) => (
                    <MenuItem key={sem} value={sem}>
                      Semester {sem}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setCircularFile(e.target.files?.[0])}
                style={{ marginBottom: 16 }}
              />
            </Grid>
          </Grid>
          {uploadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {uploadError}
            </Alert>
          )}
          {uploadSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {uploadSuccess}
            </Alert>
          )}
          <Button
            variant="contained"
            disabled={uploadingCircular || !circularTitle || !circularFile || !circularCourse || !circularSemester}
            onClick={handleUploadCircular}
          >
            {uploadingCircular ? 'Uploading...' : 'Upload'}
          </Button>
        </Paper>

        {/* Circular Management Section */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.5)',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Manage Circulars
          </Typography>
          
          {/* Circular Filters */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Course</InputLabel>
              <Select 
                value={circularFilterCourse} 
                onChange={(e) => setCircularFilterCourse(e.target.value)} 
                label="Filter by Course"
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
              <InputLabel>Filter by Semester</InputLabel>
              <Select 
                value={circularFilterSemester} 
                onChange={(e) => setCircularFilterSemester(e.target.value)} 
                label="Filter by Semester"
              >
                <MenuItem value="">All Semesters</MenuItem>
                {SEMESTERS.map((sem) => (
                  <MenuItem key={sem} value={sem}>
                    Semester {sem}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button 
              variant="outlined" 
              onClick={fetchCirculars}
              disabled={loadingCirculars}
            >
              {loadingCirculars ? 'Loading...' : 'Apply Filters'}
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => {
                setCircularFilterCourse('');
                setCircularFilterSemester('');
                fetchCirculars();
              }}
            >
              Clear Filters
            </Button>
          </Stack>

          {/* Circulars List */}
          {loadingCirculars ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : circulars.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Course</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Semester</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Uploaded</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {circulars.map((circular) => (
                    <TableRow key={circular._id} hover>
                      <TableCell>{circular.title}</TableCell>
                      <TableCell>{circular.course}</TableCell>
                      <TableCell>Semester {circular.semester}</TableCell>
                      <TableCell>
                        {new Date(circular.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = `${api.defaults.baseURL}/${circular.pdfPath}`;
                            link.target = '_blank';
                            link.click();
                          }}
                        >
                          View PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="textSecondary" align="center" sx={{ py: 3 }}>
              No circulars found
            </Typography>
          )}
        </Paper>

        {/* Admissions Table */}
        <TableContainer
          component={Paper}
          sx={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.3)',
            overflow: 'hidden',
            '& .MuiTableHead-root': { background: 'rgba(33,150,243,0.1)' },
            '& .MuiTableRow-root:hover': { background: 'rgba(33,150,243,0.05)' },
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Course</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Semester</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                  Actions
                </TableCell>
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
                    <TableCell>{admission.rollNo || '—'}</TableCell>
                    <TableCell>{admission.nameEnglish || admission.userId?.name || '—'}</TableCell>
                    <TableCell>{admission.email || admission.userId?.email || '—'}</TableCell>
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

        {/* Admission Details Dialog */}
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
              border: '1px solid rgba(255,255,255,0.3)',
            },
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
            {/* Admission details UI omitted for brevity—reuse your existing details UI */}
            {/* Just ensure you toggle tabs and display details & documents */}
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
                      border: '1px solid rgba(33, 150,243, 0.1)'
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
                          border: '1px solid rgba(33, 150,243, 0.1)'
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
                          border: '1px solid rgba(33, 150,243, 0.1)'
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
                          border: '1px solid rgba(33, 150,243, 0.1)'
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
                          border: '1px solid rgba(33, 150,243, 0.1)'
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

        {/* Credentials Update Dialog */}
        <Dialog
          open={openCredentialsDialog}
          onClose={() => setOpenCredentialsDialog(false)}
          PaperProps={{
            sx: {
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.3)',
            },
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
