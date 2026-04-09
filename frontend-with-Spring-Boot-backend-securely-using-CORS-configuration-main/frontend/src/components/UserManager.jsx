import { useEffect, useState } from "react";
import { createUser, deleteUser, getAllUsers, updateUser } from "../services/userService";

const initialUser = {
  name: "",
  email: "",
  password: "",
  mobile: ""
};

function UserManager({ isAdmin }) {
  const [users, setUsers] = useState([]);
  const [draft, setDraft] = useState(initialUser);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (loadError) {
      if (loadError.response?.status === 403) {
        setError("Permission denied: only admins can manage users.");
      } else {
        setError("Failed to load users.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const resetForm = () => {
    setDraft(initialUser);
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setDraft({
      name: user.name,
      email: user.email,
      password: "",
      mobile: String(user.mobile ?? "")
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const payload = {
      ...draft,
      mobile: Number(draft.mobile)
    };

    try {
      if (editingId) {
        await updateUser(editingId, payload);
      } else {
        await createUser(payload);
      }

      resetForm();
      await loadUsers();
    } catch (submitError) {
      const responseData = submitError.response?.data;
      const message =
        responseData?.error ||
        (responseData && typeof responseData === "object" ? Object.values(responseData).join(" ") : "") ||
        "Unable to save user.";
      setError(message);
    }
  };

  const handleDelete = async (userId) => {
    setError("");

    try {
      await deleteUser(userId);
      await loadUsers();
    } catch (deleteError) {
      if (deleteError.response?.status === 403) {
        setError("Permission denied: you cannot delete this user.");
      } else {
        setError("Unable to delete user.");
      }
    }
  };

  if (!isAdmin) {
    return (
      <section className="card">
        <h2>User Manager</h2>
        <div className="alert error">Permission denied: only admins can access user management.</div>
      </section>
    );
  }

  return (
    <section className="manager-grid">
      <form className="card" onSubmit={handleSubmit}>
        <h2>{editingId ? "Update user" : "Create user"}</h2>
        {error ? <div className="alert error">{error}</div> : null}

        <label htmlFor="user-name">Name</label>
        <input id="user-name" name="name" value={draft.name} onChange={handleChange} required />

        <label htmlFor="user-email">Email</label>
        <input id="user-email" name="email" type="email" value={draft.email} onChange={handleChange} required />

        <label htmlFor="user-password">Password</label>
        <input
          id="user-password"
          name="password"
          type="password"
          value={draft.password}
          onChange={handleChange}
          required
        />

        <label htmlFor="user-mobile">Mobile</label>
        <input id="user-mobile" name="mobile" value={draft.mobile} onChange={handleChange} required />

        <div className="row-actions">
          <button type="submit">{editingId ? "Save changes" : "Create user"}</button>
          {editingId ? (
            <button type="button" className="ghost" onClick={resetForm}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="card">
        <h2>All users</h2>
        {loading ? <p>Loading users...</p> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.mobile}</td>
                  <td>{user.role}</td>
                  <td className="table-actions">
                    <button type="button" className="small" onClick={() => handleEdit(user)}>
                      Edit
                    </button>
                    <button type="button" className="small danger" onClick={() => handleDelete(user.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 ? (
                <tr>
                  <td colSpan="5">No users found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default UserManager;


