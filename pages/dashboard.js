import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { withAuth } from "../components/withAuth";

function Dashboard({ ...props }) {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        fetchTodos(user.uid);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login"); // Redirect to login after logout
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Fetch to-dos from Firestore based on the user's ID
  const fetchTodos = async (userId) => {
    const q = query(collection(db, "todos"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    setTodos(
      querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        isEditing: false,
      }))
    );
  };

  // Add a new to-do
  const addTodo = async () => {
    if (newTodo === "" || !auth.currentUser) {
      return;
    }

    const docRef = await addDoc(collection(db, "todos"), {
      text: newTodo,
      userId: auth.currentUser.uid,
    });

    setTodos([...todos, { text: newTodo, id: docRef.id, isEditing: false }]);
    setNewTodo("");
  };

  // Delete a to-do
  const deleteTodo = async (id) => {
    await deleteDoc(doc(db, "todos", id));
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // Set a to-do item to editing mode
  const setEditing = (id) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === id) {
          return { ...todo, isEditing: true };
        }
        return todo;
      })
    );
  };

  // Handle change in the edit text field
  const handleEditChange = (e, id) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === id) {
          return { ...todo, text: e.target.value };
        }
        return todo;
      })
    );
  };

  // Submit the edited to-do
  const submitEdit = async (id) => {
    const editedTodo = todos.find((todo) => todo.id === id);
    await updateDoc(doc(db, "todos", id), { text: editedTodo.text });

    setTodos(
      todos.map((todo) => {
        if (todo.id === id) {
          return { ...todo, isEditing: false };
        }
        return todo;
      })
    );
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ color: "var(--color-latte)", textAlign: "center" }}>
        Dashboard
      </h1>
      <button
        onClick={handleLogout}
        style={{
          background: "var(--color-macchiato)",
          color: "var(--color-latte)",
          margin: "10px 0",
        }}
      >
        Logout
      </button>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Add a new to-do"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <button
          onClick={addTodo}
          style={{
            background: "var(--color-frappe)",
            color: "var(--color-latte)",
          }}
        >
          Add To-Do
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
        }}
      >
        {todos.map((todo) => (
          <div
            key={todo.id}
            style={{
              background: "var(--color-espresso)",
              color: "var(--color-latte)",
              borderRadius: "8px",
              padding: "15px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            {todo.isEditing ? (
              <input
                type="text"
                value={todo.text}
                onChange={(e) => handleEditChange(e, todo.id)}
                style={{ width: "100%", marginBottom: "10px" }}
              />
            ) : (
              <p>{todo.text}</p>
            )}
            {todo.isEditing ? (
              <button
                onClick={() => submitEdit(todo.id)}
                style={{
                  background: "var(--color-macchiato)",
                  color: "var(--color-latte)",
                }}
              >
                Submit
              </button>
            ) : (
              <button
                onClick={() => setEditing(todo.id)}
                style={{
                  background: "var(--color-macchiato)",
                  color: "var(--color-latte)",
                  marginRight: "10px",
                }}
              >
                Edit
              </button>
            )}
            <button
              onClick={() => deleteTodo(todo.id)}
              style={{
                background: "var(--color-macchiato)",
                color: "var(--color-latte)",
                marginTop: "10px",
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default withAuth(Dashboard);
