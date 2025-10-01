import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api'; // Assuming api is configured for authenticated requests
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({
    name: '',
    currentEmail: '',
    newEmail: '',
    mobileNumber: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get('/auth/profile'); // Endpoint to get user profile
        setProfileData({
          name: res.data.user.username || '',
          currentEmail: res.data.user.email || '',
          newEmail: '', // New email starts empty
          mobileNumber: res.data.user.mobileNumber || '',
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.response?.data?.error || "Failed to load profile data.");
        if (err.response?.status === 401) {
          logout(); // Log out if unauthorized
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [logout]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatePayload = {
        username: profileData.name,
        email: profileData.newEmail || profileData.currentEmail, // Use new email if provided, otherwise current
        mobileNumber: profileData.mobileNumber,
      };
      await api.put('/auth/profile', updatePayload);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);

      // Update current email if new email was provided
      if (profileData.newEmail) {
        setProfileData(prevData => ({
          ...prevData,
          currentEmail: profileData.newEmail,
          newEmail: '' // Clear new email field after update
        }));
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.error || "Failed to update profile.");
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
      setTimeout(() => { setError(''); setSuccess(''); }, 3000);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-[#0C1017] text-white relative">
      <Link to="/dashboard" className="absolute top-4 left-4 text-white text-xs lg:text-base hover:text-purple-300 transition-colors flex items-center gap-1 lg:gap-2">
        <FaArrowLeft className="inline-block" /> Dashboard
      </Link>
      {/* Left Section: Profile Image and Welcome */}
      <div className="w-full sm:w-1/3 lg:w-1/4 p-6 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-white/20">
        <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center text-5xl font-bold text-gray-300 mb-4">
          {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <p className="text-xl font-semibold text-white">Welcome <span className="capitalize text-purple-300">{profileData.name}</span></p>
        <button
          className="mt-6 bg-red-500 cursor-pointer hover:bg-red-700 transition-colors text-white px-4 py-2 rounded-md"
          onClick={logout}
        >
          Logout
        </button>
      </div>

      {/* Right Section: Personal Information Form */}
      <div className="w-full sm:w-2/3 lg:w-3/4 p-3 sm:p-6 flex flex-col sm:justify-center md:items-center">
        <div className="sm:bg-[#090c10] sm:px-3 sm:py-8 xl:px-7 xl:py-12 sm:border border-white/20 md:w-96 lg:w-[30rem] xl:w-[35rem]">
        <div className="flex justify-between items-center mb-6 lg:mb-10 xl:mb-16">
          <h1 className="text-lg md:text-2xl font-bold text-white">Personal Information</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm md:text-base px-2 py-1 md:px-4 md:py-2 rounded-md"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4 text-center">{success}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-2 lg:gap-4">
          <label htmlFor="name" className="text-white/70 text-sm xl:mt-3">Your Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={profileData.name}
            onChange={handleInputChange}
            className="bg-[#05070A] text-white px-4 py-2 rounded-md border border-white/20 outline-none"
            disabled={!isEditing}
            required
          />

          <label htmlFor="currentEmail" className="text-white/70 text-sm xl:mt-3">Current Email</label>
          <input
            type="email"
            id="currentEmail"
            name="currentEmail"
            value={profileData.currentEmail}
            className="bg-[#05070A] text-white px-4 py-2 rounded-md border border-white/20 outline-none"
            disabled
          />

          <label htmlFor="newEmail" className="text-white/70 text-sm xl:mt-3">New Email (optional)</label>
          <input
            type="email"
            id="newEmail"
            name="newEmail"
            value={profileData.newEmail}
            onChange={handleInputChange}
            className="bg-[#05070A] text-white px-4 py-2 rounded-md border border-white/20 outline-none"
            disabled={!isEditing}
          />

          <label htmlFor="mobileNumber" className="text-white/70 text-sm xl:mt-3">Mobile Number (optional)</label>
          <input
            type="text"
            id="mobileNumber"
            name="mobileNumber"
            value={profileData.mobileNumber}
            onChange={handleInputChange}
            className="bg-[#05070A] text-white px-4 py-2 rounded-md border border-white/20 outline-none"
            disabled={!isEditing}
          />

          {isEditing && (
            <button
              type="submit"
              disabled={loading}
              className="mt-4 bg-green-600 hover:bg-green-700 transition-colors text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </form>
        </div>
      </div>
    </div>
  );
}
