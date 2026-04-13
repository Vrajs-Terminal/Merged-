import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/axios';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { Mail, Lock, ArrowRight, UserPlus, X, User, ArrowLeft, Key, ShieldCheck, Users } from 'lucide-react';
import meshBg from '../../assets/image-mesh-gradient.png';
import './login.css';

type AuthState = 'LOGIN' | 'FORGOT_PASSWORD' | 'VERIFY_OTP' | 'RESET_PASSWORD';
type LoginMethod = 'PASSWORD' | 'OTP' | 'QR';

export default function Login() {
    // Top-Level State
    const [view, setView] = useState<AuthState>('LOGIN');
    const [loginMethod, setLoginMethod] = useState<LoginMethod>('PASSWORD');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [settings, setSettings] = useState<any>(null);

    // Login Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Forgot Password Flow State
    const [resetEmail, setResetEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [countdown, setCountdown] = useState(0);

    // Dynamic Admin Setup State
    const [isSettingUp, setIsSettingUp] = useState(false);
    const [adminName, setAdminName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    const login = useAuthStore(state => state.login);
    const navigate = useNavigate();

    // Load Company Settings for Branding
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings/COMPANY_BRANDING');
                setSettings(res.data);
            } catch (err) {
                console.error("Failed to load company branding", err);
            }
        };
        fetchSettings();
    }, []);

    // OTP Countdown Timer Logic
    useEffect(() => {
        let timer: any;
        if (countdown > 0 && view === 'VERIFY_OTP') {
            timer = window.setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => window.clearTimeout(timer);
    }, [countdown, view]);

    // Switch View Helper
    const switchView = (newView: AuthState) => {
        setView(newView);
        setError('');
        setSuccess('');
    };

    // =====================================
    // LOGIN FLOW
    // =====================================
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (loginMethod === 'PASSWORD' && (!email.trim() || !password)) {
            setError('Please enter both email and password');
            return;
        }

        if (loginMethod === 'OTP' && !email.trim()) {
            setError('Please enter your email to receive OTP');
            return;
        }

        setIsLoading(true);
        try {
            if (loginMethod === 'PASSWORD') {
                const response = await api.post('/auth/login', { email, password });
                const { token, user } = response.data;
                login(token, user);
                navigate('/');
            } else if (loginMethod === 'OTP') {
                // Trigger OTP send
                await api.post('/auth/send-login-otp', { email });
                setResetEmail(email);
                setCountdown(30);
                switchView('VERIFY_OTP');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // =====================================
    // SETUP ADMIN FLOW
    // =====================================
    const handleSetupAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!adminName || !adminEmail || !adminPassword) {
            setError('Please fill all fields to create an admin');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/setup-admin', {
                name: adminName,
                email: adminEmail,
                password: adminPassword
            });
            setSuccess('Admin created successfully! You can now log in.');
            setIsSettingUp(false);
            setEmail(adminEmail);
            setPassword(adminPassword);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to setup admin');
        } finally {
            setIsLoading(false);
        }
    };

    // =====================================
    // FORGOT PASSWORD FLOW
    // =====================================
    const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!resetEmail.trim()) {
            setError('Please enter your email address');
            return;
        }

        setIsLoading(true);
        try {
            const res = await api.post('/auth/forgot-password', { email: resetEmail });
            setSuccess(res.data.message || 'OTP sent to your email.');
            setCountdown(30); // 30 second cooldown to resend
            switchView('VERIFY_OTP');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to process request');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (countdown > 0) return;

        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const res = await api.post('/auth/forgot-password', { email: resetEmail });
            setSuccess(res.data.message || 'A new OTP has been sent.');
            setOtp('');
            setCountdown(30);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to resend OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!otp.trim()) {
            setError('Please enter the 6-digit OTP');
            return;
        }

        setIsLoading(true);
        try {
            if (loginMethod === 'OTP') {
                const response = await api.post('/auth/login-with-otp', { email: resetEmail, otp });
                const { token, user } = response.data;
                login(token, user);
                navigate('/');
            } else {
                await api.post('/auth/verify-otp', { email: resetEmail, otp });
                setSuccess('OTP verified. Please set your new password.');
                switchView('RESET_PASSWORD');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid or expired OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!newPassword || newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/reset-password', {
                email: resetEmail,
                otp,
                newPassword
            });
            setSuccess('Password reset successfully. You can now log in.');
            setEmail(resetEmail);
            setPassword('');
            setLoginMethod('PASSWORD');
            switchView('LOGIN');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Password reset failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper" style={{ backgroundImage: settings?.photo ? `linear-gradient(135deg, rgba(15, 23, 42, 0.7), rgba(30, 41, 59, 0.8)), url(${settings.photo})` : (settings?.login_bg ? `linear-gradient(135deg, rgba(15, 23, 42, 0.55), rgba(30, 41, 59, 0.65)), url(${settings.login_bg})` : `linear-gradient(135deg, rgba(15, 23, 42, 0.55), rgba(30, 41, 59, 0.65)), url(${meshBg})`) }}>
            <div className="login-card">
                {/* ---------- LOGIN VIEW ---------- */}
                {view === 'LOGIN' && (
                    <div className="view-panel fade-in">
                        <div className="login-header">
                            <img src={settings?.logo || logo} alt="Company Logo" className="login-logo" style={{ maxHeight: '80px', objectFit: 'contain' }} />
                            <h2>Welcome Back</h2>
                            <p>Access your {settings?.companyName || 'Organization'} Dashboard</p>
                        </div>

                        <div className="login-methods">
                            <button className={`method-tab ${loginMethod === 'PASSWORD' ? 'active' : ''}`} onClick={() => setLoginMethod('PASSWORD')}>
                                <Lock size={14} /> Password
                            </button>
                            <button className={`method-tab ${loginMethod === 'OTP' ? 'active' : ''}`} onClick={() => setLoginMethod('OTP')}>
                                <ShieldCheck size={14} /> OTP
                            </button>
                            <button className={`method-tab ${loginMethod === 'QR' ? 'active' : ''}`} onClick={() => setLoginMethod('QR')}>
                                <Key size={14} /> QR
                            </button>
                        </div>

                        {loginMethod !== 'QR' ? (
                            <form className="login-form" onSubmit={handleLoginSubmit}>
                                {success && <div className="login-success">{success}</div>}
                                {error && <div className="login-error">{error}</div>}

                                <div className="input-group">
                                    <label>Email Address</label>
                                    <div className="input-wrapper">
                                        <Mail size={18} className="input-icon" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                            placeholder="Enter your email"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {loginMethod === 'PASSWORD' && (
                                    <div className="input-group">
                                        <div className="label-row">
                                            <label>Password</label>
                                            <button
                                                type="button"
                                                className="forgot-link"
                                                onClick={() => {
                                                    setResetEmail(email);
                                                    switchView('FORGOT_PASSWORD');
                                                }}
                                            >
                                                Forgot password?
                                            </button>
                                        </div>
                                        <div className="input-wrapper">
                                            <Lock size={18} className="input-icon" />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                                placeholder="Enter your password"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <button type="submit" className="login-btn" disabled={isLoading}>
                                    <span>{isLoading ? 'Processing...' : (loginMethod === 'OTP' ? 'Send OTP' : 'Sign In')}</span>
                                    {!isLoading && <ArrowRight size={18} />}
                                </button>
                            </form>
                        ) : (
                            <div className="qr-container fade-in">
                                <div className="qr-box">
                                    <div className="qr-placeholder">
                                        <Users size={48} style={{ opacity: 0.2 }} />
                                    </div>
                                </div>
                                <div className="qr-info">
                                    <h4>Login with QR Code</h4>
                                    <p>Scan the QR code with your mobile app to sign in instantly.</p>
                                </div>
                                <button className="login-btn btn-primary" onClick={() => setLoginMethod('PASSWORD')} style={{ width: '100%' }}>
                                    Back to Password
                                </button>
                            </div>
                        )}

                        <div className="login-footer">
                            <span>Secure Access Portal • MineHR-Solutions Pvt. Ltd.</span>
                            <button
                                type="button"
                                onClick={() => { setIsSettingUp(true); setError(''); setSuccess(''); }}
                                className="setup-admin-link"
                            >
                                <UserPlus size={14} /> Create First Admin Account
                            </button>
                        </div>
                    </div>
                )}

                {/* ---------- FORGOT PASSWORD VIEW ---------- */}
                {view === 'FORGOT_PASSWORD' && (
                    <div className="view-panel fade-in slide-in-right">
                        <div className="login-header">
                            <button className="back-btn" onClick={() => switchView('LOGIN')}>
                                <ArrowLeft size={20} />
                            </button>
                            <div className="icon-circle"><Key size={24} /></div>
                            <h2>Forgot Password</h2>
                            <p>Enter your email to receive a secure OTP</p>
                        </div>

                        <form className="login-form" onSubmit={handleForgotPasswordSubmit}>
                            {error && <div className="login-error">{error}</div>}

                            <div className="input-group">
                                <label>Email Address</label>
                                <div className="input-wrapper">
                                    <Mail size={18} className="input-icon" />
                                    <input
                                        type="email"
                                        value={resetEmail}
                                        onChange={(e) => { setResetEmail(e.target.value); setError(''); }}
                                        placeholder="admin@company.com"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button type="submit" className="login-btn btn-primary" disabled={isLoading}>
                                <span>{isLoading ? 'Sending OTP...' : 'Send OTP'}</span>
                            </button>
                        </form>
                    </div>
                )}

                {/* ---------- VERIFY OTP VIEW ---------- */}
                {view === 'VERIFY_OTP' && (
                    <div className="view-panel fade-in slide-in-right">
                        <div className="login-header">
                            <button className="back-btn" onClick={() => switchView('FORGOT_PASSWORD')}>
                                <ArrowLeft size={20} />
                            </button>
                            <div className="icon-circle"><ShieldCheck size={24} /></div>
                            <h2>Enter OTP</h2>
                            <p>We sent a 6-digit code to <strong>{resetEmail}</strong></p>
                        </div>

                        <form className="login-form" onSubmit={handleVerifyOtpSubmit}>
                            {success && <div className="login-success">{success}</div>}
                            {error && <div className="login-error">{error}</div>}

                            <div className="input-group">
                                <label>6-Digit OTP</label>
                                <div className="input-wrapper">
                                    <Lock size={18} className="input-icon" />
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => {
                                            // Allow only numbers
                                            const val = e.target.value.replace(/\D/g, '');
                                            setOtp(val);
                                            setError('');
                                        }}
                                        placeholder="123456"
                                        className="otp-input text-center tracking-widest text-lg font-bold"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button type="submit" className="login-btn btn-primary" disabled={isLoading || otp.length !== 6}>
                                <span>{isLoading ? 'Verifying...' : 'Verify OTP'}</span>
                            </button>

                            <div className="resend-container">
                                <span className="resend-text">Didn't receive the code?</span>
                                {countdown > 0 ? (
                                    <span className="countdown-text">Resend available in {countdown}s</span>
                                ) : (
                                    <button type="button" onClick={handleResendOTP} className="resend-link" disabled={isLoading}>
                                        Resend OTP
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                {/* ---------- RESET PASSWORD VIEW ---------- */}
                {view === 'RESET_PASSWORD' && (
                    <div className="view-panel fade-in slide-in-right">
                        <div className="login-header">
                            <div className="icon-circle text-green"><ShieldCheck size={24} /></div>
                            <h2>Create New Password</h2>
                            <p>Your OTP was verified. Please set a new secure password.</p>
                        </div>

                        <form className="login-form" onSubmit={handleResetPasswordSubmit}>
                            {success && <div className="login-success">{success}</div>}
                            {error && <div className="login-error">{error}</div>}

                            <div className="input-group">
                                <label>New Password</label>
                                <div className="input-wrapper">
                                    <Lock size={18} className="input-icon" />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                                        placeholder="At least 6 characters"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button type="submit" className="login-btn btn-success" disabled={isLoading}>
                                <span>{isLoading ? 'Updating...' : 'Save New Password'}</span>
                            </button>
                        </form>
                    </div>
                )}

                {/* ---------- ADMIN SETUP OVERLAY ---------- */}
                {isSettingUp && (
                    <div className="admin-setup-overlay fade-in">
                        <div className="overlay-header">
                            <h3 className="overlay-title">Create Admin Account</h3>
                            <button onClick={() => setIsSettingUp(false)} className="close-btn">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSetupAdmin} className="overlay-form">
                            {error && <div className="login-error">{error}</div>}

                            <div className="input-group">
                                <label>Full Name</label>
                                <div className="input-wrapper">
                                    <User size={18} className="input-icon" />
                                    <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="e.g. John Doe" required />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Admin Email</label>
                                <div className="input-wrapper">
                                    <Mail size={18} className="input-icon" />
                                    <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@company.com" required />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Secure Password</label>
                                <div className="input-wrapper">
                                    <Lock size={18} className="input-icon" />
                                    <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Create a password" required />
                                </div>
                            </div>

                            <button type="submit" className="login-btn mt-auto" disabled={isLoading}>
                                <span>{isLoading ? 'Creating...' : 'Create Admin Account'}</span>
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
