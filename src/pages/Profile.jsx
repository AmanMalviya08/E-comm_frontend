import React, { useEffect, useState } from 'react';
import { User, MapPin, Plus, Trash2, CheckCircle2, Shield } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState('');

  // New address state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    label: 'Home'
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/profile');
      if (res.data.success) {
        setProfile(res.data.profile);
        setName(res.data.profile.name || user?.name || '');
        setPhone(res.data.profile.phone || '');
        setBio(res.data.profile.bio || '');
      }
    } catch (err) {
      console.warn('Failed to load profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/users/profile', { name, phone, bio });
      if (res.data.success) {
        setProfile(res.data.profile);
        setEditing(false);
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/addresses', newAddr);
      if (res.data.success) {
        setProfile(prev => ({ ...prev, addresses: res.data.addresses }));
        setShowAddAddress(false);
        setNewAddr({ street: '', city: '', state: '', postalCode: '', country: 'India', label: 'Home' });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding address');
    }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      const res = await api.delete(`/users/addresses/${addrId}`);
      if (res.data.success) {
        setProfile(prev => ({ ...prev, addresses: res.data.addresses }));
      }
    } catch (err) {
      alert('Error deleting address');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">User Profile</h1>
        <p className="text-xs text-gray-500 mt-1">Manage your identity, personal info, and saved shipping addresses</p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-5 h-5" /> {message}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-black">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile?.name || user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              {user?.role === 'admin' && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold mt-1">
                  <Shield className="w-3 h-3" /> Admin Account
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="text-xs font-bold px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Phone Number</label>
              <input
                type="text"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Bio</label>
              <textarea
                rows="2"
                placeholder="Short bio..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
            >
              Save Changes
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-gray-400 block">Phone</span>
              <p className="font-semibold text-gray-800">{profile?.phone || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Bio</span>
              <p className="font-semibold text-gray-800">{profile?.bio || 'No bio provided'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Saved Addresses Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-gray-900">Saved Addresses</h3>
          </div>
          <button
            onClick={() => setShowAddAddress(!showAddAddress)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline"
          >
            <Plus className="w-4 h-4" /> Add Address
          </button>
        </div>

        {showAddAddress && (
          <form onSubmit={handleAddAddress} className="bg-gray-50 p-4 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">New Shipping Address</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Street address *"
                required
                value={newAddr.street}
                onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="City *"
                required
                value={newAddr.city}
                onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="State *"
                required
                value={newAddr.state}
                onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Postal code *"
                required
                value={newAddr.postalCode}
                onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAddAddress(false)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl"
              >
                Save Address
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profile?.addresses?.map((addr) => (
            <div
              key={addr._id}
              className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-start justify-between gap-3"
            >
              <div className="text-xs space-y-1">
                <span className="font-bold text-gray-800 bg-gray-200 px-2 py-0.5 rounded-md inline-block">
                  {addr.label || 'Home'}
                </span>
                <p className="text-gray-700 font-medium">{addr.street}</p>
                <p className="text-gray-500">{addr.city}, {addr.state} - {addr.postalCode}</p>
                <p className="text-gray-400">{addr.country}</p>
              </div>

              <button
                onClick={() => handleDeleteAddress(addr._id)}
                className="text-gray-400 hover:text-red-500 transition p-1"
                title="Delete address"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {(!profile?.addresses || profile.addresses.length === 0) && (
            <p className="text-xs text-gray-400 italic">No saved addresses found. Add one above.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
