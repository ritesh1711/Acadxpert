import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';

const COURSES = ['MCA', 'MBA', 'MTech'];
const SEMESTERS = [1, 2, 3, 4];

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AdminCirculars = () => {
  const navigate = useNavigate();

  const [circularTitle, setCircularTitle] = useState('');
  const [circularFile, setCircularFile] = useState(null);
  const [circularCourse, setCircularCourse] = useState('');
  const [circularSemester, setCircularSemester] = useState('');
  const [uploadingCircular, setUploadingCircular] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  const [circulars, setCirculars] = useState([]);
  const [loadingCirculars, setLoadingCirculars] = useState(false);
  const [circularFilterCourse, setCircularFilterCourse] = useState('');
  const [circularFilterSemester, setCircularFilterSemester] = useState('');

  const fetchCirculars = async () => {
    try {
      setLoadingCirculars(true);
      const params = {};
      if (circularFilterCourse) params.course = circularFilterCourse;
      if (circularFilterSemester) params.semester = circularFilterSemester;
      const response = await api.get('/admin/circulars', { params });
      setCirculars(response.data?.data || []);
    } catch (err) {
      console.error('Error fetching circulars:', err);
      setCirculars([]);
    } finally {
      setLoadingCirculars(false);
    }
  };

  useEffect(() => {
    fetchCirculars();
  }, []);

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
      const response = await api.post('/admin/circulars', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (response.data.success) {
        setUploadSuccess('Circular uploaded successfully');
        setCircularTitle('');
        setCircularFile(null);
        setCircularCourse('');
        setCircularSemester('');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600">
      <Container maxWidth="xl" sx={{ pt: 4, pb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Manage Circulars</Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/dashboard')}
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
          >
            Back to Dashboard
          </Button>
        </Box>

        <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)', borderRadius: 4 }}>
          <Typography variant="h6" gutterBottom>Upload Circular (PDF)</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField label="Title" value={circularTitle} onChange={(e) => setCircularTitle(e.target.value)} fullWidth sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2, minWidth: '200px' }}>
                <InputLabel>Course</InputLabel>
                <Select value={circularCourse} onChange={(e) => setCircularCourse(e.target.value)} label="Course">
                  {COURSES.map((course) => (
                    <MenuItem key={course} value={course}>{course}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2, minWidth: '200px' }}>
                <InputLabel>Semester</InputLabel>
                <Select value={circularSemester} onChange={(e) => setCircularSemester(e.target.value)} label="Semester">
                  {SEMESTERS.map((sem) => (
                    <MenuItem key={sem} value={sem}>Semester {sem}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <input type="file" accept="application/pdf" onChange={(e) => setCircularFile(e.target.files?.[0])} style={{ marginBottom: 16 }} />
            </Grid>
          </Grid>
          {uploadError && (<Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>)}
          {uploadSuccess && (<Alert severity="success" sx={{ mb: 2 }}>{uploadSuccess}</Alert>)}
          <Button variant="contained" disabled={uploadingCircular || !circularTitle || !circularFile || !circularCourse || !circularSemester} onClick={handleUploadCircular}>
            {uploadingCircular ? 'Uploading...' : 'Upload'}
          </Button>
        </Paper>

        <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)', borderRadius: 4 }}>
          <Typography variant="h6" gutterBottom>Existing Circulars</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Course</InputLabel>
              <Select value={circularFilterCourse} onChange={(e) => setCircularFilterCourse(e.target.value)} label="Filter by Course">
                <MenuItem value="">All Courses</MenuItem>
                {COURSES.map((course) => (
                  <MenuItem key={course} value={course}>{course}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Semester</InputLabel>
              <Select value={circularFilterSemester} onChange={(e) => setCircularFilterSemester(e.target.value)} label="Filter by Semester">
                <MenuItem value="">All Semesters</MenuItem>
                {SEMESTERS.map((sem) => (
                  <MenuItem key={sem} value={sem}>Semester {sem}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="outlined" onClick={fetchCirculars} disabled={loadingCirculars}>{loadingCirculars ? 'Loading...' : 'Apply Filters'}</Button>
            <Button variant="outlined" onClick={() => { setCircularFilterCourse(''); setCircularFilterSemester(''); fetchCirculars(); }}>Clear Filters</Button>
          </Stack>

          {loadingCirculars ? (
            <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
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
                      <TableCell>{new Date(circular.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <Button variant="contained" size="small" startIcon={<DownloadIcon />} onClick={() => {
                          const link = document.createElement('a');
                          link.href = `${api.defaults.baseURL}/${circular.pdfPath}`;
                          link.target = '_blank';
                          link.click();
                        }}>View PDF</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="textSecondary" align="center" sx={{ py: 3 }}>No circulars found</Typography>
          )}
        </Paper>
      </Container>
    </div>
  );
};

export default AdminCirculars;


