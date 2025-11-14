import React, { useEffect, useState } from "react";

// Backend API base URL from Vite .env
const API_BASE = `${import.meta.env.VITE_API_URL}/api/products`;

export default function ProductCrud() {
  const emptyForm = { id: null, name: "", price: "", quantity: "", description: "" };

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  // Auto–detect correct array format from backend
  function normalizeData(data) {
    if (Array.isArray(data)) {
      if (Array.isArray(data[0])) return data[0];   // [[...]]
      return data;                                  // [...]
    }
    if (data.data) return data.data;                // { data: [...] }
    if (data.products) return data.products;        // { products: [...] }
    return [];                                      // Unsupported
  }

  async function fetchAll() {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

      const data = await res.json();
      const finalData = normalizeData(data);

      setProducts(finalData);
      setError("");
    } catch (e) {
      setError("Could not load products: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return setError("Name is required");

    const payload = {
      name: form.name,
      price: parseFloat(form.price) || 0,
      quantity: parseInt(form.quantity, 10) || 0,
      description: form.description || ""
    };

    try {
      setLoading(true);
      let res;

      if (editing && form.id) {
        res = await fetch(`${API_BASE}/${form.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) throw new Error("Save failed");

      await fetchAll();
      setForm(emptyForm);
      setEditing(false);
      setError("");
    } catch (e) {
      setError("Save failed: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(product) {
    setForm({
      id: product.id,
      name: product.name ?? "",
      price: product.price ?? "",
      quantity: product.quantity ?? "",
      description: product.description ?? ""
    });
    setEditing(true);
    setError("");
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      await fetchAll();
      setError("");
    } catch (e) {
      setError("Delete failed: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleCancel() {
    setForm(emptyForm);
    setEditing(false);
    setError("");
  }

  return (
    <div style={styles.container}>
      <h2>{import.meta.env.VITE_APP_TITLE || "Product CRUD"}</h2>

      <div style={styles.grid}>
        {/* Product List */}
        <div style={styles.card}>
          <h3>Products {loading ? "⏳" : ""}</h3>
          {error && <div style={styles.error}>{error}</div>}
          <button onClick={fetchAll} style={styles.smallBtn}>Refresh</button>

          <div style={{ marginTop: 8 }}>
            {products.length === 0 ? (
              <div style={styles.empty}>No products found.</div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.name}</td>
                      <td>{p.price}</td>
                      <td>{p.quantity}</td>
                      <td style={{ maxWidth: 220 }}>{p.description}</td>
                      <td>
                        <button onClick={() => handleEdit(p)} style={styles.actionBtn}>Edit</button>
                        <button onClick={() => handleDelete(p.id)} style={styles.deleteBtn}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Form */}
        <div style={styles.card}>
          <h3>{editing ? "Edit Product" : "Add Product"}</h3>

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>
              Name
              <input name="name" value={form.name} onChange={handleChange} style={styles.input} />
            </label>

            <label style={styles.label}>
              Price
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                style={styles.input}
                type="number"
                step="0.01"
              />
            </label>

            <label style={styles.label}>
              Quantity
              <input
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                style={styles.input}
                type="number"
              />
            </label>

            <label style={styles.label}>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                style={{ ...styles.input, height: 80 }}
              />
            </label>

            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" style={styles.primaryBtn} disabled={loading}>
                {editing ? "Update" : "Create"}
              </button>

              <button type="button" onClick={handleCancel} style={styles.secondaryBtn}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: "Arial, sans-serif", padding: 20, maxWidth: 1100, margin: "0 auto" },
  grid: { display: "grid", gridTemplateColumns: "1fr 420px", gap: 16, alignItems: "start" },
  card: { padding: 16, borderRadius: 8, border: "1px solid #ddd", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  label: { display: "block", marginBottom: 8 },
  input: { width: "100%", padding: 8, marginTop: 6, boxSizing: "border-box" },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  primaryBtn: { padding: "8px 12px", borderRadius: 6, border: "none", cursor: "pointer", background: "#007bff", color: "#fff" },
  secondaryBtn: { padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc", background: "#fff", cursor: "pointer" },
  actionBtn: { marginRight: 8, padding: "4px 8px", cursor: "pointer" },
  deleteBtn: { padding: "4px 8px", cursor: "pointer", background: "#ffdddd", border: "1px solid #f99" },
  smallBtn: { padding: "6px 8px", marginBottom: 8 },
  error: { color: "#a00", marginBottom: 8 },
  empty: { color: "#666", padding: 12 }
};
