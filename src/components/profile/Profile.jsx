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

  const hasChanges = () => {
    if (imageFile) return true;
    if (!user) return false;
    return (
      formData.firstName !== (user.firstName || "") ||
      formData.lastName !== (user.lastName || "") ||
      formData.email !== (user.email || "") ||
      formData.password !== (user.password || "") ||
      formData.dateOfBirth !== (user.dateOfBirth || "") ||
      formData.age !== (user.age || "") ||
      formData.userType !== (user.userType || "") ||
      formData.purposeOfStudy !== (user.purposeOfStudy || "")
    );
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

      if (imageFile) {
        data.append("imageUrl", imageFile);
      }

      const res = await axios.put(
        `http://localhost:8080/api/users/${user.id}`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      setIsEditing(false);
      setImageFile(null);
      window.dispatchEvent(new Event("userUpdated"));
    } catch (err) {
      console.error(err);
      setError("Failed to update profile. " + (err.response?.data || ""));
    } finally {
      setLoading(false);
    }
  };

  if (!user)
    return <div className="text-white p-5 text-center">Loading Profile...</div>;

  return (
    <div className="container-fluid p-0 overflow-hidden">
      <div className="row g-0">
        <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <main className="col-md-12 vh-100 overflow-auto p-4 p-lg-5">
          <div
            className="glass-card p-5  text-white"
            style={{ marginTop: "80px" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-5">
              <div className="d-flex align-items-center gap-4">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center bg-accent text-white fs-1 fw-bold shadow-glow position-relative overflow-hidden"
                  style={{ width: "90px", height: "90px", cursor: "pointer" }}
                  onClick={() =>
                    document.getElementById("profilePictureInput").click()
                  }
                >
                  {user.imageUrl || imageFile ? (
                    <img
                      src={
                        imageFile
                          ? URL.createObjectURL(imageFile)
                          : `http://localhost:8080/uploads/${user.imageUrl}`
                      }
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : user.firstName ? (
                    user.firstName.charAt(0).toUpperCase()
                  ) : (
                    user.email.charAt(0).toUpperCase()
                  )}
                  <input
                    type="file"
                    id="profilePictureInput"
                    className="d-none"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <div
                    className="position-absolute bottom-0 w-100 bg-dark bg-opacity-75 text-center"
                    style={{
                      fontSize: "0.7rem",
                      padding: "2px 0",
                      letterSpacing: "1px",
                    }}
                  >
                    EDIT
                  </div>
                </div>
                <div>
                  <h2 className="mb-1 fw-bold">
                    {user.firstName || "User"} {user.lastName || ""}
                  </h2>
                  <p className="text-muted mb-0">
                    <i className="bi bi-envelope me-2"></i>
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-danger px-4 py-2"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>Logout
                </button>
              </div>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}

            <form
              onSubmit={handleSave}
              className="bg-dark bg-opacity-25 p-4 rounded border border-secondary border-opacity-25"
            >
              <h5 className="mb-4 fw-bold border-bottom pb-3">User Details</h5>

              <div className="row g-3 mb-4">
                {[
                  { label: "First Name", name: "firstName", type: "text" },
                  { label: "Last Name", name: "lastName", type: "text" },
                  { label: "Email", name: "email", type: "email" },
                  { label: "Password", name: "password", type: "password" },
                  {
                    label: "Date of Birth",
                    name: "dateOfBirth",
                    type: "date",
                  },
                  { label: "Age", name: "age", type: "number" },
                ].map((field) => (
                  <div className="col-md-6" key={field.name}>
                    <label className="form-label small text-light">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      className="form-control bg-dark border-secondary text-white"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                    />
                  </div>
                ))}

                <div className="col-md-6">
                  <label className="form-label small text-light">
                    User Type
                  </label>
                  <select
                    className="form-select bg-dark border-secondary text-white"
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                  >
                    <option value="">Select Role</option>
                    <option value="Student">Student</option>
                    <option value="Professional">Professional</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small text-light">Purpose</label>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-white"
                    name="purposeOfStudy"
                    value={formData.purposeOfStudy}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {hasChanges() && (
                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setFormData({
                        firstName: user.firstName || "",
                        lastName: user.lastName || "",
                        dateOfBirth: user.dateOfBirth || "",
                        age: user.age || "",
                        email: user.email || "",
                        password: user.password || "",
                        userType: user.userType || "",
                        purposeOfStudy: user.purposeOfStudy || "",
                      });
                      setImageFile(null);
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-accent"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

const ProfileItem = ({ label, value, icon }) => (
  <div className="col-md-6 col-lg-4">
    <div className="p-3 rounded bg-dark bg-opacity-50 border border-white border-opacity-10 h-100">
      <div className="text-muted small mb-2 text-uppercase">
        <i className={`bi ${icon} me-2`}></i>
        {label}
      </div>
      <div className="fs-5 fw-semibold">{value || "-"}</div>
    </div>
  </div>
);

export default Profile;
