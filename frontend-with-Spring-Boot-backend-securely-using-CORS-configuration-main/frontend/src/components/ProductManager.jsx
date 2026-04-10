import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getMyProducts,
  updateProduct
} from "../services/productService";

const initialProduct = {
  productName: "",
  productDescription: "",
  productSKU: "",
  productPrice: "",
  productDiscount: "0"
};

function ProductManager({ isAdmin }) {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [view, setView] = useState("all");
  const [draft, setDraft] = useState(initialProduct);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isMyView = view === "my";

  const loadProducts = async (selectedView = view) => {
    setLoading(true);
    setError("");

    try {
      const data = selectedView === "my" ? await getMyProducts() : await getAllProducts();
      setProducts(data);
    } catch (loadError) {
      if (loadError.response?.status === 403) {
        setError("Permission denied: you do not have access to this product list.");
      } else {
        setError("Failed to load products.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(view);
  }, [view]);

  const canModifyProduct = (product) => {
    if (isAdmin) {
      return true;
    }

    // The API response does not include owner email, so "my" view is the reliable ownership scope.
    if (isMyView) {
      return true;
    }

    return user?.name && product?.userName && user.name === product.userName;
  };

  const visibleProducts = useMemo(() => products, [products]);

  const resetForm = () => {
    setDraft(initialProduct);
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const payload = {
      ...draft,
      productPrice: Number(draft.productPrice),
      productDiscount: Number(draft.productDiscount)
    };

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }

      resetForm();
      await loadProducts(view);
    } catch (submitError) {
      if (submitError.response?.status === 403) {
        setError("Permission denied: you cannot modify this product.");
      } else {
        const responseData = submitError.response?.data;
        const message =
          responseData?.error ||
          (responseData && typeof responseData === "object" ? Object.values(responseData).join(" ") : "") ||
          "Unable to save product.";
        setError(message);
      }
    }
  };

  const startEdit = (product) => {
    if (!canModifyProduct(product)) {
      setError("Permission denied: only owners or admins can edit this product.");
      return;
    }

    setEditingId(product.productId);
    setDraft({
      productName: product.productName,
      productDescription: product.productDescription,
      productSKU: product.productSKU,
      productPrice: String(product.productPrice),
      productDiscount: String(product.productDiscount)
    });
  };

  const handleDelete = async (product) => {
    if (!canModifyProduct(product)) {
      setError("Permission denied: only owners or admins can delete this product.");
      return;
    }

    setError("");

    try {
      await deleteProduct(product.productId);
      await loadProducts(view);
    } catch (deleteError) {
      if (deleteError.response?.status === 403) {
        setError("Permission denied: you cannot delete this product.");
      } else {
        setError("Unable to delete product.");
      }
    }
  };

  return (
    <section className="manager-grid">
      <form className="card" onSubmit={handleSubmit}>
        <h2>{editingId ? "Update product" : "Create product"}</h2>
        {error ? <div className="alert error">{error}</div> : null}

        <label htmlFor="product-name">Name</label>
        <input
          id="product-name"
          name="productName"
          value={draft.productName}
          onChange={handleChange}
          minLength={3}
          required
        />

        <label htmlFor="product-description">Description</label>
        <textarea
          id="product-description"
          name="productDescription"
          value={draft.productDescription}
          onChange={handleChange}
          minLength={20}
          rows={4}
          required
        />

        <label htmlFor="product-sku">SKU</label>
        <input id="product-sku" name="productSKU" value={draft.productSKU} onChange={handleChange} required />

        <label htmlFor="product-price">Price</label>
        <input
          id="product-price"
          name="productPrice"
          type="number"
          min={1}
          value={draft.productPrice}
          onChange={handleChange}
          required
        />

        <label htmlFor="product-discount">Discount</label>
        <input
          id="product-discount"
          name="productDiscount"
          type="number"
          min={0}
          max={100}
          value={draft.productDiscount}
          onChange={handleChange}
          required
        />

        <div className="row-actions">
          <button type="submit">{editingId ? "Save changes" : "Create product"}</button>
          {editingId ? (
            <button type="button" className="ghost" onClick={resetForm}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="card">
        <div className="section-header">
          <h2>Products</h2>
          <div className="segmented-control">
            <button
              type="button"
              className={view === "all" ? "small active" : "small"}
              onClick={() => setView("all")}
            >
              All Products
            </button>
            <button
              type="button"
              className={view === "my" ? "small active" : "small"}
              onClick={() => setView("my")}
            >
              My Products
            </button>
          </div>
        </div>

        {loading ? <p>Loading products...</p> : null}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Owner</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((product) => {
                const canModify = canModifyProduct(product);

                return (
                  <tr key={product.productId}>
                    <td>{product.productName}</td>
                    <td>{product.productSKU}</td>
                    <td>{product.productPrice}</td>
                    <td>{product.productDiscount}%</td>
                    <td>{product.userName || "Unknown"}</td>
                    <td className="table-actions">
                      <button
                        type="button"
                        className="small"
                        onClick={() => startEdit(product)}
                        disabled={!canModify}
                        title={!canModify ? "Only owners or admins can edit." : ""}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="small danger"
                        onClick={() => handleDelete(product)}
                        disabled={!canModify}
                        title={!canModify ? "Only owners or admins can delete." : ""}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && visibleProducts.length === 0 ? (
                <tr>
                  <td colSpan="6">No products found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default ProductManager;


