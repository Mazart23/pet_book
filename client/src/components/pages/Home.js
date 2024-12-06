import React, { useState, useEffect } from "react";
import useToken from "../contexts/TokenContext";
import { fetchPosts, addPost } from "/client/src/Api";
import jwtDecode from "jwt-decode";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [newPost, setNewPost] = useState({
    description: "",
    images: [],
    location: "",
  });

  const { token } = useToken();

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const fetchedPosts = await fetchPosts();
        setPosts(fetchedPosts);
      } catch (err) {
        setError("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const handleFileChange = (event) => {
    setNewPost((prev) => ({
      ...prev,
      images: Array.from(event.target.files),
    }));
  };

  const handleAddPost = async () => {
    if (!token) {
      setError("User is not authenticated. Please log in.");
      return;
    }

    if (!newPost.description.trim()) {
      setError("Post description cannot be empty.");
      return;
    }

    setError("");
    setSuccessMessage("");
    try {
      const addedPost = await addPost(token, newPost.description, newPost.images, newPost.location);
      setPosts([addedPost, ...posts]); // Add new post to the top of the feed
      setNewPost({ description: "", images: [], location: "" });
      setSuccessMessage("Post added successfully!");
    } catch (err) {
      setError("Failed to add post. Please try again.");
    }
  };

  return (
    <div>
      <h1>Home</h1>

      {loading && <p>Loading posts...</p>}

      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      {!loading && posts.length === 0 && <p>No posts available.</p>}

      <div>
        <h2>Create a New Post</h2>
        <textarea
          placeholder="Write something..."
          value={newPost.description}
          onChange={(e) => setNewPost((prev) => ({ ...prev, description: e.target.value }))}
        />
        <input
          type="file"
          multiple
          onChange={handleFileChange}
        />
        <input
          type="text"
          placeholder="Location (optional)"
          value={newPost.location}
          onChange={(e) => setNewPost((prev) => ({ ...prev, location: e.target.value }))}
        />
        <button onClick={handleAddPost}>Add Post</button>
      </div>

      <div>
        <h2>Latest Posts</h2>
        {posts.map((post) => (
          <div key={post._id} className="post">
            <h3>{post.description}</h3>
            {post.images_urls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Post ${post._id}`}
                style={{ width: "100px", height: "100px", objectFit: "cover", marginRight: "10px" }}
              />
            ))}
            <p>Location: {post.location || "N/A"}</p>
            <p>Posted at: {new Date(post.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
