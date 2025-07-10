// frontend/src/app/page.js
"use client";

// REMOVE THIS LINE: export const dynamic = 'force-dynamic'; // We are solving the build error properly

import { useEffect, useState, Suspense } from "react"; // <--- Import Suspense
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Fetches a menu item by ID.
 * @param {number} id The ID of the menu item to retrieve.
 */
async function deleteMenu(id) {
  const res = await fetch(`http://127.0.0.1:8000/api/menu/${id}/`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to retrieve menu");
  }
  return Promise.resolve();
}

/**
 * Fetches menu data from the server.
 */
async function getData() {
  // IMPORTANT: For Docker Compose, backend is 'backend' service name
  // Use the environment variable NEXT_PUBLIC_API_URL that you defined in .env.local
  const api_url = process.env.NEXT_PUBLIC_API_URL || "http://backend:8000/api";
  const res = await fetch(`${api_url}/menu/`);
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

/**
 * Represents a single menu item.
 */
const MenuItem = ({ id, name, price, onEdit, onDelete }) => {
  return (
    <div className="menu-item" data-id={id}>
      <div className="menu-item-info">
        <div className="menu-item-name">{name}</div>
        <div className="menu-item-price">${price.toFixed(2)}</div>
      </div>
      <div className="menu-item-actions">
        <button className="edit-button" onClick={onEdit}>
          Edit
        </button>
        <button
          className="delete-button"
          onClick={() => {
            deleteMenu(id).then(() => onDelete(id));
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

/**
 * Component that uses client-only hooks like useSearchParams.
 * Wrapped in Suspense.
 */
function SearchParamsHandler() {
  const router = useRouter();
  const params = useSearchParams();

  // State for displaying a success message
  const [displaySuccessMessage, setDisplaySuccessMessage] = useState({
    show: false,
    type: "", // either 'add' or 'update'
  });

  // Detect changes in URL parameters for success messages
  useEffect(() => {
    if (!!params.get("action")) {
      setDisplaySuccessMessage({
        type: params.get("action"),
        show: true,
      });
      router.replace("/"); // Clear the query param
    }
  }, [params, router]);

  // Automatically hide the success message after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (displaySuccessMessage.show) {
        setDisplaySuccessMessage({ show: false, type: "" });
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [displaySuccessMessage.show]);

  return (
    <>
      {displaySuccessMessage.show && (
        <p className="success-message">
          {displaySuccessMessage.type === "add" ? "Added a" : "Modified a"} menu item.
        </p>
      )}
    </>
  );
}


/**
 * The main page component.
 */
export default function Page() {
  const [menuItems, setMenuItems] = useState(null);
  const router = useRouter(); // Still needed directly for navigation buttons

  // Fetch menu items on component mount
  useEffect(() => {
    const fetchData = async () => {
      const data = await getData();
      setMenuItems(data);
    };
    fetchData().catch(console.error);
  }, []);

  // Handle deletion of a menu item
  const handleDelete = (id) => {
    setMenuItems((items) => items.filter((item) => item.id !== id));
  };

  return (
    <div>
      <button className="add-button" onClick={() => router.push("/add")}>
        Add
      </button>
      {/* Wrap SearchParamsHandler in Suspense */}
      <Suspense fallback={<div>Loading messages...</div>}>
        <SearchParamsHandler />
      </Suspense>

      {menuItems ? (
        menuItems.map((item) => (
          <MenuItem
            key={item.id}
            id={item.id}
            name={item.name}
            price={item.price}
            onEdit={() => router.push(`/update/${item.id}`)}
            onDelete={handleDelete}
          />
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
