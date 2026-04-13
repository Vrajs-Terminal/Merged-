import { useState, useRef } from 'react';
import { User, Mail, Shield, Camera, Save, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/axios';
import './account-settings.css';

export default function AccountSettings() {
    const { user } = useAuthStore();
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [avatar, setAvatar] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // In a real app, we'd send avatar data too
            await api.put(`/auth/user/${user?.id}/update-profile`, {
                name,
                email
            });
            alert("Profile updated successfully!");
            // Update local store if needed (we'd need a better way to refresh user data)
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        setIsSaving(true);
        try {
            await api.put(`/auth/user/${user?.id}/change-password`, {
                currentPassword,
                newPassword
            });
            alert("Password changed successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to change password.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h1>Account Settings</h1>
                <p>Manage your profile and security preferences</p>
            </div>

            <div className="settings-grid">
                {/* Profile Section */}
                <div className="settings-card profile-card">
                    <div className="card-header">
                        <User size={20} />
                        <h2>Public Profile</h2>
                    </div>

                    <div className="avatar-section">
                        <div className="avatar-wrapper">
                            {avatar || user?.name ? (
                                <div className="avatar-preview">
                                    {avatar ? <img src={avatar} alt="Avatar" /> : user?.name.charAt(0).toUpperCase()}
                                </div>
                            ) : (
                                <div className="avatar-placeholder"><User size={40} /></div>
                            )}
                            <button className="avatar-edit-btn" onClick={() => fileInputRef.current?.click()}>
                                <Camera size={16} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                style={{ display: 'none' }}
                                accept="image/*"
                            />
                        </div>
                        <div className="avatar-info">
                            <h3>{user?.name || "User Name"}</h3>
                            <p>{user?.role || "Administrator"}</p>
                        </div>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="settings-form">
                        <div className="form-group">
                            <label><User size={14} /> Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div className="form-group">
                            <label><Mail size={14} /> Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                            />
                        </div>
                        <button type="submit" className="save-btn" disabled={isSaving}>
                            <Save size={16} /> {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>

                {/* Security Section */}
                <div className="settings-card security-card">
                    <div className="card-header">
                        <Shield size={20} />
                        <h2>Security</h2>
                    </div>

                    <form onSubmit={handlePasswordChange} className="settings-form">
                        <div className="form-group">
                            <label><Lock size={14} /> Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="form-group">
                            <label><Lock size={14} /> New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="form-group">
                            <label><Lock size={14} /> Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <button type="submit" className="save-btn" disabled={isSaving}>
                            <Lock size={16} /> {isSaving ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
