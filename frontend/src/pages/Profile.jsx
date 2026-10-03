import React, { useState, useRef } from 'react';
import {
  User,
  Mail,
  Upload,
  Trash2,
  FileText,
  Download,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Plus,
  Camera,
  GraduationCap,
  Code2,
  Layers,
  BookOpen,
  Sparkles,
  Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const Profile = () => {
  const {
    user,
    updateProfile,
    uploadPhoto,
    removePhoto,
    uploadResume,
    removeResume
  } = useAuth();
  const { success, error: showError } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Address sub-form
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false
  });
  const [addingAddress, setAddingAddress] = useState(false);

  // Upload loaders
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Modal confirmations
  const [deletePhotoModal, setDeletePhotoModal] = useState(false);
  const [deleteResumeModal, setDeleteResumeModal] = useState(false);

  const photoInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    await updateProfile({ name, addresses });
    setSavingProfile(false);
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please upload an image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('Photo size cannot exceed 5MB.');
      return;
    }

    setUploadingPhoto(true);
    await uploadPhoto(file);
    setUploadingPhoto(false);
  };

  const handleResumeSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
      showError('Please select a valid resume document (.pdf, .doc, .docx).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showError('Resume file size cannot exceed 10MB.');
      return;
    }

    setUploadingResume(true);
    await uploadResume(file);
    setUploadingResume(false);
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.street || !newAddress.city || !newAddress.pincode) {
      showError('Please fill in required address fields.');
      return;
    }

    const updated = [...addresses, newAddress];
    setAddresses(updated);
    setNewAddress({
      fullName: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      isDefault: false
    });
    setAddingAddress(false);
    updateProfile({ addresses: updated });
  };

  const handleDeleteAddress = (index) => {
    const updated = addresses.filter((_, idx) => idx !== index);
    setAddresses(updated);
    updateProfile({ addresses: updated });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Account Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your verified administrator details, resume credentials, profile photo, and addresses
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Avatar & Resume Document Management */}
        <div className="space-y-6">
          
          {/* Profile Photo Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-4">
            <div className="relative inline-block mx-auto">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-lg mx-auto"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-3xl flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg mx-auto">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}

              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition-transform hover:scale-110"
                title="Change Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <input
              type="file"
              ref={photoInputRef}
              onChange={handlePhotoSelect}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{user?.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="px-3 py-0.5 text-[10px] font-extrabold rounded-full uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {user?.role} Access
                </span>
                {user?.role === 'admin' && (
                  <span className="px-3 py-0.5 text-[10px] font-extrabold rounded-full uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Verified Engineer
                  </span>
                )}
              </div>
            </div>

            {user?.profilePhoto && (
              <button
                onClick={() => setDeletePhotoModal(true)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center justify-center gap-1 mx-auto hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Photo</span>
              </button>
            )}
          </div>

          {/* Resume Upload Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Resume & Credentials</span>
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload your latest resume document (.pdf, .doc) for verification and administrative archival.
            </p>

            <input
              type="file"
              ref={resumeInputRef}
              onChange={handleResumeSelect}
              accept=".pdf,.doc,.docx,application/pdf"
              className="hidden"
            />

            {user?.resume?.url ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {user.resume.originalName || 'Ujjwal_Singh_Resume.pdf'}
                    </span>
                  </div>
                  <a
                    href={user.resume.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg"
                    title="Download/View"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>

                <button
                  onClick={() => setDeleteResumeModal(true)}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete Resume</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => resumeInputRef.current?.click()}
                disabled={uploadingResume}
                className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <Upload className="w-5 h-5 text-slate-400" />
                <span>{uploadingResume ? 'Uploading...' : 'Upload Resume Document'}</span>
                <span className="text-[10px] text-slate-400 font-normal">PDF, DOC up to 10MB</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Personal Details, Resume Showcase & Address Management */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Resume Engineering Profile Showcase */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Education & Academic Credentials</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Records</span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="font-extrabold text-xs text-indigo-950 dark:text-indigo-200">
                    B.Tech in Computer Science and Engineering
                  </h4>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">Sep. 2023 – May 2027</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  GCRG Group of Institutions, Dr. A.P.J Abdul Kalam Technical University (AKTU), Lucknow, Uttar Pradesh
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-900 dark:text-white">
                    <span>12th Standard (Intermediate)</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">81%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Kamla Nehru Institute of Child and Education, Sultanpur, UP (2021-2022)
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-900 dark:text-white">
                    <span>10th Standard (High School)</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">88.8%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Kamla Nehru Institute of Child and Education, Sultanpur, UP (2019-2020)
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Skills Showcase */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Code2 className="w-4 h-4 text-blue-600" />
                <span>Technical Skills & Core Stack</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {['C++', 'Python', 'Java', 'C', 'JavaScript', 'Node.js', 'Express.js', 'React.js', 'Next.js', 'FastAPI', 'Tailwind CSS', 'MongoDB', 'PostgreSQL', 'SQL', 'Linux', 'GitHub', 'Google Cloud Platform', 'Cloudinary', 'MediaPipe', 'OpenCV'].map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Relevant Coursework */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>Relevant Engineering Coursework</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                {['Data Structures & Algorithms', 'Database Management', 'Artificial Intelligence', 'Discrete Mathematics', 'Algorithms Analysis', 'Digital Electronics', 'Systems Programming', 'Computer Architecture'].map((course) => (
                  <div key={course} className="p-2 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 text-purple-900 dark:text-purple-300 border border-purple-100 dark:border-purple-900/30 text-center font-medium">
                    {course}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Personal Info Form */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Personal Information
            </h3>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500/30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Email Address (Primary Account)
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {savingProfile ? 'Saving Changes...' : 'Save Profile Details'}
                </button>
              </div>
            </form>
          </div>

          {/* Saved Addresses Section */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span>Saved Shipping Addresses</span>
              </h3>

              {!addingAddress && (
                <button
                  onClick={() => setAddingAddress(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Address</span>
                </button>
              )}
            </div>

            {/* Address List */}
            {addresses.length === 0 && !addingAddress ? (
              <p className="text-xs text-slate-500 py-4 text-center">No addresses saved yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{addr.fullName}</span>
                      <button
                        onClick={() => handleDeleteAddress(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete Address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">{addr.phone}</p>
                    <p>{addr.street}</p>
                    <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p>{addr.country}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Address Form */}
            {addingAddress && (
              <form onSubmit={handleAddAddress} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase">New Address Details</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Recipient Name"
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="col-span-2 px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl"
                    required
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAddingAddress(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg shadow-sm"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Photo Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deletePhotoModal}
        title="Remove Profile Photo"
        message="Are you sure you want to remove your profile photo? It will be deleted from our servers."
        confirmText="Remove Photo"
        isDestructive={true}
        onConfirm={async () => {
          await removePhoto();
          setDeletePhotoModal(false);
        }}
        onCancel={() => setDeletePhotoModal(false)}
      />

      {/* Resume Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteResumeModal}
        title="Delete Uploaded Resume"
        message="Are you sure you want to delete your uploaded resume document?"
        confirmText="Delete Document"
        isDestructive={true}
        onConfirm={async () => {
          await removeResume();
          setDeleteResumeModal(false);
        }}
        onCancel={() => setDeleteResumeModal(false)}
      />
    </div>
  );
};
