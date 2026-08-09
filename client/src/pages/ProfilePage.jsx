import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext.jsx";

function buildProfilePayload(values) {
  const payload = {
    name: values.name,
    notificationPreferences: {
      statusUpdates: values.statusUpdates,
      resolutionRequests: values.resolutionRequests,
    },
  };

  if (values.locality || values.longitude !== "" || values.latitude !== "") {
    payload.preferredLocation = {};

    if (values.locality) {
      payload.preferredLocation.locality = values.locality;
    }

    if (values.longitude !== "" && values.latitude !== "") {
      payload.preferredLocation.coordinates = [Number(values.longitude), Number(values.latitude)];
    }
  }

  return payload;
}

function createInitialProfileValues(user) {
  return {
    name: user?.name || "",
    locality: user?.preferredLocation?.locality || "",
    longitude: user?.preferredLocation?.point?.coordinates?.[0] || "",
    latitude: user?.preferredLocation?.point?.coordinates?.[1] || "",
    statusUpdates: user?.notificationPreferences?.statusUpdates ?? true,
    resolutionRequests: user?.notificationPreferences?.resolutionRequests ?? true,
  };
}

function ProfileForm({ logout, updateProfile, user }) {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [values, setValues] = useState(() => createInitialProfileValues(user));

  function handleChange(event) {
    const { checked, name, type, value } = event.target;

    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await updateProfile(buildProfilePayload(values));
      setMessage("Profile updated.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main>
      <h1>Your profile</h1>
      <p>{user.email}</p>
      <p>{user.role}</p>
      <form onSubmit={handleSubmit}>
        <p>
          <label htmlFor="name">Name</label>
          <input id="name" name="name" onChange={handleChange} required type="text" value={values.name} />
        </p>
        <fieldset>
          <legend>Preferred locality</legend>
          <p>
            <label htmlFor="locality">Locality</label>
            <input id="locality" name="locality" onChange={handleChange} type="text" value={values.locality} />
          </p>
          <p>
            <label htmlFor="longitude">Longitude</label>
            <input id="longitude" name="longitude" onChange={handleChange} type="number" value={values.longitude} />
          </p>
          <p>
            <label htmlFor="latitude">Latitude</label>
            <input id="latitude" name="latitude" onChange={handleChange} type="number" value={values.latitude} />
          </p>
        </fieldset>
        <fieldset>
          <legend>Notifications</legend>
          <p>
            <label htmlFor="statusUpdates">Status updates</label>
            <input
              checked={values.statusUpdates}
              id="statusUpdates"
              name="statusUpdates"
              onChange={handleChange}
              type="checkbox"
            />
          </p>
          <p>
            <label htmlFor="resolutionRequests">Resolution requests</label>
            <input
              checked={values.resolutionRequests}
              id="resolutionRequests"
              name="resolutionRequests"
              onChange={handleChange}
              type="checkbox"
            />
          </p>
        </fieldset>
        {error ? <p role="alert">{error}</p> : null}
        {message ? <p>{message}</p> : null}
        <button type="submit">Save profile</button>
      </form>
      <button onClick={logout} type="button">
        Logout
      </button>
    </main>
  );
}

function ProfilePage() {
  const { logout, status, updateProfile, user } = useAuth();

  if (status === "loading") {
    return (
      <main>
        <p>Loading profile...</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <ProfileForm key={user.id} logout={logout} updateProfile={updateProfile} user={user} />;
}

export default ProfilePage;
