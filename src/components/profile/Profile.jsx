import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../header/Header";

const Profile = ({ isSidebarOpen, toggleSidebar }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    age: "",
    email: "",
    password: "",
    userType: "",
    purposeOfStudy: "",
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      setFormData({
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        dateOfBirth: u.dateOfBirth || "",
        age: u.age || "",
        email: u.email || "",
        password: u.password || "",
        userType: u.userType || "",
        purposeOfStudy: u.purposeOfStudy || "",
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = new FormData();
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("dateOfBirth", formData.dateOfBirth || "2000-01-01");
      data.append("age", formData.age || 0);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("userType", formData.userType);
      data.append("purposeOfStudy", formData.purposeOfStudy);
      
      // UserController requires imageUrl as MultipartFile, so provide empty file if none selected
      if (imageFile) {
        data.append("imageUrl", imageFile);
      } else {
        data.append("imageUrl", new File([""], "empty.jpg"));
      }

      const res = await axios.put(`http://localhost:8080/api/users/${user.id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update profile. " + (err.response?.data || ""));
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="text-white p-5 text-center">Loading Profile...</div>;

  return (
    <div className="container-fluid p-0 overflow-hidden">
      <div className="row g-0">
        <main className={`${isSidebarOpen ? "col-md-10" : "col-md-12"} vh-100 overflow-auto p-4 p-lg-5 transition-all`}>
          <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          
          <div className="glass-card p-5 mt-4 text-white">
            <div className="d-flex align-items-center justify-content-between mb-5">
              <div className="d-flex align-items-center gap-4">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center bg-accent text-white fs-1 fw-bold shadow-glow" 
                  style={{ width: "90px", height: "90px" }}
                >
                  {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="mb-1 fw-bold">{user.firstName || "User"} {user.lastName || ""}</h2>
                  <p className="text-muted mb-0"><i className="bi bi-envelope me-2"></i>{user.email}</p>
                </div>
              </div>
              <div className="d-flex gap-2">
                {!isEditing && (
                  <button className="btn btn-outline-light px-4 py-2" onClick={() => setIsEditing(true)}>
                    <i className="bi bi-pencil me-2"></i>Edit Profile
                  </button>
                )}
                <button className="btn btn-danger px-4 py-2" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>Logout
                </button>
              </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {!isEditing ? (
              <>
                <h5 className="mb-4 fw-bold border-bottom border-secondary border-opacity-25 pb-3">User Details</h5>
                <div className="row g-4 mb-4">
                  <ProfileItem label="First Name" value={user.firstName} icon="bi-person" />
                  <ProfileItem label="Last Name" value={user.lastName} icon="bi-person" />
                  <ProfileItem label="Date of Birth" value={user.dateOfBirth} icon="bi-calendar-date" />
                  <ProfileItem label="Age" value={user.age ? `${user.age} yrs` : "N/A"} icon="bi-calendar-event" />
                  <ProfileItem label="Role Type" value={user.userType} icon="bi-person-badge" />
                  <ProfileItem label="Purpose of Study" value={user.purposeOfStudy} icon="bi-bullseye" />
                </div>
              </>
            ) : (
              <form onSubmit={handleSave} className="bg-dark bg-opacity-25 p-4 rounded border border-secondary border-opacity-25">
                <h5 className="mb-4 fw-bold border-bottom border-secondary border-opacity-25 pb-3">Edit Details</h5>
                
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small text-muted">First Name</label>
                    <input type="text" className="form-control bg-dark border-secondary text-white" name="firstName" value={formData.firstName} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Last Name</label>
                    <input type="text" className="form-control bg-dark border-secondary text-white" name="lastName" value={formData.lastName} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Date of Birth</label>
                    <input type="date" className="form-control bg-dark border-secondary text-white" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Age</label>
                    <input type="number" className="form-control bg-dark border-secondary text-white" name="age" value={formData.age} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted">User Type</label>
                    <select className="form-select bg-dark border-secondary text-white" name="userType" value={formData.userType} onChange={handleChange}>
                      <option value="">Select Role</option>
                      <option value="Student">Student</option>
                      <option value="Professional">Professional</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Purpose of Study</label>
                    <input type="text" className="form-control bg-dark border-secondary text-white" name="purposeOfStudy" value={formData.purposeOfStudy} onChange={handleChange} />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label small text-muted">Profile Image (Optional)</label>
                    <input type="file" className="form-control bg-dark border-secondary text-white" accept="image/*" onChange={handleFileChange} />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button type="submit" className="btn btn-accent" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

const ProfileItem = ({ label, value, icon }) => (
  <div className="col-md-6 col-lg-4">
    <div className="p-3 rounded bg-dark bg-opacity-50 border border-white border-opacity-10 h-100">
      <div className="text-muted small mb-2 text-uppercase tracking-wider">
        <i className={`bi ${icon} me-2`}></i>{label}
      </div>
      <div className="fs-5 fw-semibold">{value || "-"}</div>
    </div>
  </div>
);

export default Profile;
