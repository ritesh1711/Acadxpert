import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Badge,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CloseIcon from "@mui/icons-material/Close";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentIcon from "@mui/icons-material/Assignment";
import WarningIcon from "@mui/icons-material/Warning";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import FolderIcon from "@mui/icons-material/Folder";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { toast } from "react-toastify";

export default function AdminDashboard() {
  // State management
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Filtering state
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterSemester, setFilterSemester] = useState("all");

  const navigate = useNavigate();

  // Course and semester options
  const courseOptions = [
    { value: "all", label: "All Courses" },
    { value: "MCA", label: "MCA" },
    { value: "MBA", label: "MBA" },
    { value: "MTech", label: "MTech" },
    { value: "BTech", label: "BTech" },
    { value: "BBA", label: "BBA" },
  ];

  const semesterOptions = [
    { value: "all", label: "All Semesters" },
    { value: "1", label: "Semester 1" },
    { value: "2", label: "Semester 2" },
    { value: "3", label: "Semester 3" },
    { value: "4", label: "Semester 4" },
    { value: "5", label: "Semester 5" },
    { value: "6", label: "Semester 6" },
    { value: "7", label: "Semester 7" },
    { value: "8", label: "Semester 8" },
  ];

  useEffect(() => {
    // Check if user is admin
    const token = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
      navigate("/admin/login");
      return;
    }

    // Fetch all admissions
    fetchAdmissions();
  }, [navigate]);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get("http://localhost:8000/admin/admissions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setAdmissions(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching admissions:", err);
      setError("Failed to load admissions data");
      toast.error("Failed to load admissions data");
    } finally {
      setLoading(false);
    }
  };

  // Filter admissions based on selected course and semester
  const getFilteredAdmissions = () => {
    return admissions.filter((admission) => {
      // Filter by course
      const matchesCourse = filterCourse === "all" || admission.course === filterCourse;

      // Filter by semester
      const matchesSemester = filterSemester === "all" || String(admission.semester) === filterSemester;

      return matchesCourse && matchesSemester;
    });
  };

  // Group admissions by course and semester
  const getGroupedAdmissions = () => {
    const filtered = getFilteredAdmissions();
    const grouped = {};

    // Group admissions
    filtered.forEach((admission) => {
      const course = admission.course || "Unknown";
      const semester = String(admission.semester) || "Unknown";

      if (!grouped[course]) {
        grouped[course] = {};
      }

      if (!grouped[course][semester]) {
        grouped[course][semester] = [];
      }

      grouped[course][semester].push(admission);
    });

    return grouped;
  };

  // Handle view details
  const handleViewDetails = (admission) => {
    setSelectedAdmission(admission);
    setActiveTab("details");
    setDetailsOpen(true);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    localStorage.removeItem("isAdmin");
    navigate("/admin/login");
  };

  // Helper function to get the correct rank label and value based on course
  const getRankInfo = (admission) => {
    if (!admission) return { label: "Rank", value: "N/A" };

    switch (admission.course) {
      case "MCA":
        return {
          label: "NIMCET/CET Rank",
          value: admission.nimcetRank || "N/A",
        };
      case "MBA":
        return {
          label: "CAT/CET Rank",
          value: admission.catRank || "N/A",
        };
      case "MTech":
        return {
          label: "GATE/CET Rank",
          value: admission.gateRank || "N/A",
        };
      default:
        return {
          label: "Entrance Exam Rank",
          value: admission.nimcetRank || admission.catRank || admission.gateRank || "N/A",
        };
    }
  };

  // Helper function to format dates consistently
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Get list of pending documents for an admission
  const getPendingDocuments = (admission) => {
    if (!admission || !admission.documents) return [];

    const pendingDocs = [];
    const documentLabels = {
      photo: "Photo",
      signature: "Signature",
      marksheet10th: "Marksheet 10th",
      marksheet12th: "Marksheet 12th",
      graduationMarksheet: "Graduation Marksheet",
      entranceScoreCard: "Entrance Score Card",
      characterCertificate: "Character Certificate",
    };

    // Check each document field
    for (const [field, label] of Object.entries(documentLabels)) {
      if (admission.documents?.[field]?.pending) {
        pendingDocs.push(label);
      }
    }

    return pendingDocs;
  };

  // Function to get document status text
  const getDocumentStatusText = (admission, docField) => {
    if (!admission || !admission.documents) return "Not Submitted";

    // Check if the document exists and has a status
    if (admission.documents[docField]) {
      if (admission.documents[docField].notApplicable) {
        return "Not Applicable";
      }
      if (admission.documents[docField].pending) {
        return "Pending";
      }
      return "Submitted";
    }

    return "Not Submitted";
  };

  // Get proper status color for the chips
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "success";
      case "submitted":
        return "info";
      case "rejected":
        return "error";
      default:
        return "warning";
    }
  };

  // Render details section in report format
  const renderSectionField = (label, value, xs = 6) => {
    return (
      <Grid item xs={12} sm={xs}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ fontSize: "0.75rem", mb: 0.5 }}
        >
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: "500" }}>
          {value || "N/A"}
        </Typography>
      </Grid>
    );
  };

  // Render the student details dialog
  const renderDetailsDialog = () => {
    if (!selectedAdmission) return null;

    return (
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 1,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center">
              <AssignmentIcon sx={{ mr: 1.5, color: "primary.main" }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: "600" }}>
                  Application #{selectedAdmission.applicationNo || "N/A"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Submitted on {formatDate(selectedAdmission.createdAt)}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setDetailsOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ p: 0 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{ mb: 0, borderBottom: "1px solid #eee" }}
          >
            <Tab
              value="details"
              label="Student Information"
              icon={<PersonIcon />}
              iconPosition="start"
            />
            <Tab
              value="documents"
              label="Document Status"
              icon={<FolderIcon />}
              iconPosition="start"
            />
          </Tabs>

          {activeTab === "details" && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Application Status */}
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: "#f8f9fa",
                      borderRadius: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <CalendarTodayIcon sx={{ mr: 1, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary">
                        Application Status
                      </Typography>
                    </Box>
                    <Chip
                      label={
                        selectedAdmission.status
                          ? selectedAdmission.status.toUpperCase()
                          : "PENDING"
                      }
                      color={getStatusColor(selectedAdmission.status)}
                      size="small"
                    />
                  </Paper>

                  {/* Pending Documents Warning */}
                  {getPendingDocuments(selectedAdmission).length > 0 && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        mt: 2,
                        bgcolor: "#fff8e1",
                        border: "1px solid #ffe082",
                        borderRadius: 1,
                      }}
                    >
                      <Box display="flex" alignItems="flex-start">
                        <WarningIcon color="warning" sx={{ mr: 1.5, mt: 0.25 }} />
                        <Box>
                          <Typography color="warning.dark" variant="subtitle2">
                            Pending Documents: {getPendingDocuments(selectedAdmission).length}
                          </Typography>
                          <Box component="ul" sx={{ pl: 2, mt: 0.5, mb: 0 }}>
                            {getPendingDocuments(selectedAdmission).map((doc, index) => (
                              <Typography component="li" key={index} variant="body2">
                                {doc}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  )}
                </Grid>

                {/* Personal Information */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1.5,
                      pb: 1,
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="subtitle1" fontWeight="600">
                      Personal Information
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    {renderSectionField("Full Name", selectedAdmission.nameEnglish)}
                    {renderSectionField("Email", selectedAdmission.email)}
                    {renderSectionField("Mobile Number", selectedAdmission.mobileNumber)}
                    {renderSectionField("Date of Birth", formatDate(selectedAdmission.dateOfBirth))}
                    {renderSectionField("Gender", selectedAdmission.gender)}
                    {renderSectionField("Category", selectedAdmission.category)}
                  </Grid>
                </Grid>

                {/* Academic Information */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1.5,
                      pb: 1,
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <MenuBookIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="subtitle1" fontWeight="600">
                      Academic Information
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    {renderSectionField("Course", selectedAdmission.course)}
                    {renderSectionField("Semester", selectedAdmission.semester)}
                    {renderSectionField(
                      getRankInfo(selectedAdmission).label,
                      getRankInfo(selectedAdmission).value
                    )}
                  </Grid>
                </Grid>

                {/* Parent Information */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1.5,
                      pb: 1,
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="subtitle1" fontWeight="600">
                      Parent Information
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    {renderSectionField("Father's Name", selectedAdmission.fatherNameEnglish)}
                    {renderSectionField("Father's Phone", selectedAdmission.fatherPhone)}
                    {renderSectionField("Mother's Name", selectedAdmission.motherNameEnglish)}
                    {renderSectionField("Mother's Phone", selectedAdmission.motherPhone)}
                  </Grid>
                </Grid>

                {/* Address Information */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1.5,
                      pb: 1,
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <LocationOnIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="subtitle1" fontWeight="600">
                      Address Information
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    {renderSectionField("Permanent Address", selectedAdmission.permanentAddress, 12)}
                    {renderSectionField("District", selectedAdmission.district, 4)}
                    {renderSectionField("State", selectedAdmission.state, 4)}
                    {renderSectionField("PIN Code", selectedAdmission.pinCode, 4)}
                  </Grid>
                </Grid>

                {/* Undertaking Section */}
                {selectedAdmission.undertakingText && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 1.5,
                        pb: 1,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <AssignmentIcon sx={{ mr: 1, color: "primary.main" }} />
                      <Typography variant="subtitle1" fontWeight="600">
                        Student Undertaking
                      </Typography>
                    </Box>

                    <Paper variant="outlined" sx={{ p: 2, backgroundColor: "#fffef5" }}>
                      <Typography variant="body2" fontStyle="italic">
                        {selectedAdmission.undertakingText}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {activeTab === "documents" && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2}>
                {/* Show pending documents warning */}
                {getPendingDocuments(selectedAdmission).length > 0 && (
                  <Grid item xs={12}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 3,
                        bgcolor: "#fff8e1",
                        border: "1px solid #ffe082",
                        borderRadius: 1,
                      }}
                    >
                      <Box display="flex" alignItems="flex-start">
                        <WarningIcon color="warning" sx={{ mr: 1.5, mt: 0.25 }} />
                        <Box>
                          <Typography color="warning.dark" variant="subtitle2">
                            Pending Documents: {getPendingDocuments(selectedAdmission).length}
                          </Typography>
                          <Box component="ul" sx={{ pl: 2, mt: 0.5, mb: 0 }}>
                            {getPendingDocuments(selectedAdmission).map((doc, index) => (
                              <Typography component="li" key={index} variant="body2">
                                {doc}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                )}

                {/* Document list */}
                <Grid item xs={12}>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>Document Type</TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                          <TableCell align="right"></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[
                          { field: "photo", label: "Photo" },
                          { field: "signature", label: "Signature" },
                          { field: "marksheet10th", label: "Marksheet 10th" },
                          { field: "marksheet12th", label: "Marksheet 12th" },
                          { field: "graduationMarksheet", label: "Graduation Marksheet" },
                          { field: "entranceScoreCard", label: "Entrance Score Card" },
                          { field: "characterCertificate", label: "Character Certificate" },
                        ].map((doc) => {
                          const status = getDocumentStatusText(selectedAdmission, doc.field);
                          let statusColor;
                          switch (status) {
                            case "Submitted":
                              statusColor = "success";
                              break;
                            case "Pending":
                              statusColor = "warning";
                              break;
                            case "Not Applicable":
                              statusColor = "default";
                              break;
                            default:
                              statusColor = "error";
                          }

                          const docPath = selectedAdmission.documents?.[doc.field]?.path;

                          return (
                            <TableRow
                              key={doc.field}
                              hover
                              sx={{
                                bgcolor:
                                  status === "Pending" ? "rgba(255, 244, 229, 0.3)" : "transparent",
                              }}
                            >
                              <TableCell>{doc.label}</TableCell>
                              <TableCell>
                                <Chip
                                  label={status}
                                  color={statusColor}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell align="right">
                                {docPath ? (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => {
                                      const token = localStorage.getItem("token");
                                      const filename = docPath.split("/").pop();
                                      window.open(
                                        `http://localhost:8000/uploads/${filename}?token=${token}`,
                                        "_blank"
                                      );
                                    }}
                                  >
                                    View
                                  </Button>
                                ) : null}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDetailsOpen(false)} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Render the main dashboard layout
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: 1,
          bgcolor: "#f8f9fa",
        }}
      >
        <Box display="flex" alignItems="center">
          <SchoolIcon sx={{ mr: 1.5, color: "primary.main", fontSize: "2rem" }} />
          <Typography variant="h5" fontWeight="600" color="primary.main">
            Admin Dashboard
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="error"
          startIcon={<ExitToAppIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Paper>

      {/* Filters */}
      <Paper elevation={1} sx={{ p: 2, mb: 4, borderRadius: 1 }}>
        <Box display="flex" flexWrap="wrap" alignItems="center" gap={2} mb={1.5}>
          <Typography variant="subtitle1" fontWeight="600">
            Filter Applications:
          </Typography>

          <TextField
            select
            label="Course"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ minWidth: 150 }}
          >
            {courseOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Semester"
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ minWidth: 150 }}
          >
            {semesterOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Typography variant="body2" color="text.secondary">
          Total Applications: <b>{getFilteredAdmissions().length}</b>
        </Typography>
      </Paper>

      {/* Loading State */}
      {loading ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography>Loading admissions data...</Typography>
        </Paper>
      ) : error ? (
        <Paper sx={{ p: 4, textAlign: "center", bgcolor: "#ffebee" }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      ) : (
        /* Course and Semester Grouping */
        Object.entries(getGroupedAdmissions()).map(([course, semesters]) => (
          <Card key={course} sx={{ mb: 4, borderRadius: 1, overflow: "visible" }} elevation={1}>
            <CardContent sx={{ bgcolor: "#f5f7ff", p: 0 }}>
              <Box
                display="flex"
                alignItems="center"
                sx={{ p: 2, borderBottom: "1px solid rgba(0,0,0,0.08)" }}
              >
                <SchoolIcon sx={{ mr: 1.5, color: "primary.main" }} />
                <Typography variant="h6" fontWeight="600">
                  {course}
                </Typography>
              </Box>

              {Object.keys(semesters).length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ p: 3 }}>
                  No applications found for this course.
                </Typography>
              ) : (
                Object.entries(semesters).map(([semester, students]) => (
                  <Accordion
                    key={`${course}-${semester}`}
                    defaultExpanded={Object.keys(semesters).length === 1}
                    disableGutters
                    elevation={0}
                    sx={{
                      "&:before": { display: "none" },
                      borderBottom: "1px solid rgba(0,0,0,0.08)",
                      "&:last-of-type": {
                        borderBottom: "none",
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        bgcolor: "rgba(0,0,0,0.03)",
                        "&:hover": {
                          bgcolor: "rgba(0,0,0,0.05)",
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" width="100%">
                        <Typography variant="subtitle1" fontWeight="600">
                          Semester {semester}
                        </Typography>
                        <Box ml="auto" display="flex" alignItems="center">
                          <Badge badgeContent={students.length} color="primary" sx={{ mr: 2 }}>
                            <AssignmentIcon color="action" />
                          </Badge>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                            <TableRow>
                              <TableCell width="25%">Student Name</TableCell>
                              <TableCell width="15%">Application #</TableCell>
                              <TableCell width="25%">Email</TableCell>
                              <TableCell width="15%">Status</TableCell>
                              <TableCell width="20%" align="right">
                                Actions
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {students.map((student) => {
                              const pendingDocs = getPendingDocuments(student);
                              return (
                                <TableRow
                                  key={student._id}
                                  hover
                                  sx={{
                                    "&:last-child td, &:last-child th": { border: 0 },
                                  }}
                                >
                                  <TableCell>
                                    <Typography variant="body2" fontWeight="500">
                                      {student.nameEnglish || "N/A"}
                                    </Typography>
                                    {pendingDocs.length > 0 && (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          mt: 0.5,
                                        }}
                                      >
                                        <WarningIcon
                                          color="warning"
                                          sx={{ mr: 0.5, fontSize: "0.875rem" }}
                                        />
                                        <Typography
                                          variant="caption"
                                          color="warning.dark"
                                          sx={{ fontWeight: "500" }}
                                        >
                                          {pendingDocs.length} pending document(s)
                                        </Typography>
                                      </Box>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {student.applicationNo || "N/A"}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">{student.email || "N/A"}</Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={
                                        student.status ? student.status.toUpperCase() : "PENDING"
                                      }
                                      color={getStatusColor(student.status)}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    <Button
                                      size="small"
                                      variant="contained"
                                      startIcon={<VisibilityIcon />}
                                      onClick={() => handleViewDetails(student)}
                                    >
                                      View Details
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </CardContent>
          </Card>
        ))
      )}

      {getFilteredAdmissions().length === 0 && !loading && !error && (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No admissions found for the selected filters.
          </Typography>
        </Paper>
      )}

      {/* Dialogs */}
      {renderDetailsDialog()}
    </Container>
  );
} 