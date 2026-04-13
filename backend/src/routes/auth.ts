import { Router } from 'express';
import prisma from '../lib/prismaClient';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logActivity } from '../services/activityLogger';
import nodemailer from 'nodemailer';

const router = Router();

const getJWTSecret = () => process.env.JWT_SECRET || 'secret_key_for_minehr';

router.post('/login', async (req, res) => {
    const { email, password, deviceId, deviceName, macAddress } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await prisma.user.findUnique({ 
            where: { email },
            include: { mobileDevice: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify Password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // --- Mobile Device Binding Logic ---
        // Only apply if the login request comes from a mobile device (i.e. deviceId is provided)
        if (deviceId || macAddress) {
            const currentReqId = deviceId || macAddress;
            const currentReqName = deviceName || 'Unknown Mobile Device';
            
            if (user.mobileDevice) {
                if (user.mobileDevice.status === 'Bound') {
                    if (!user.mobileDevice.isActive) {
                        return res.status(403).json({ error: 'App access has been disabled for your account. Please contact HR.' });
                    }
                    // Assume deviceId OR macAddress can match for backward/forward compatibility
                    const registeredId = user.mobileDevice.deviceId || user.mobileDevice.macAddress;
                    if (registeredId && registeredId !== currentReqId) {
                        return res.status(403).json({ error: 'Unauthorized device. Please login from your registered mobile device or submit a device change request.' });
                    }
                    // Update last login
                    await prisma.mobileDevice.update({
                        where: { userId: user.id },
                        data: { lastLoginAt: new Date() }
                    });
                } else if (user.mobileDevice.status === 'Unbound') {
                    // Auto-bind
                    await prisma.mobileDevice.update({
                        where: { userId: user.id },
                        data: {
                            deviceId: deviceId || null,
                            macAddress: macAddress || null,
                            deviceName: currentReqName,
                            status: 'Bound',
                            isActive: true,
                            lastLoginAt: new Date()
                        }
                    });
                }
            } else {
                // First ever login from mobile -> auto-bind
                await prisma.mobileDevice.create({
                    data: {
                        userId: user.id,
                        deviceId: deviceId || null,
                        macAddress: macAddress || null,
                        deviceName: currentReqName,
                        status: 'Bound',
                        isActive: true,
                        lastLoginAt: new Date()
                    }
                });
            }
        }
        // -----------------------------------

        // Generate JWT Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            getJWTSecret(),
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: (user as any).permissions
            }
        });

    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error during login', details: error.message });
    }
});

// Helper route to create an initial admin account if none exists
router.post('/setup-admin', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'An account with this email already exists.' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const admin = await prisma.user.create({
            data: {
                name,
                email,
                password_hash,
                role: 'Admin'
            }
        });

        await logActivity(admin.id, 'CREATED', 'USER', admin.name, { role: 'Admin', email });
        res.status(201).json({ message: 'Admin created successfully', admin: { id: admin.id, name: admin.name } });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to create admin', details: error.message });
    }
});

// Create a new user from the Admin dashboard
router.post('/add-user', async (req, res) => {
    const { name, email, password, role = 'Admin' } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'An account with this email already exists.' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password_hash,
                role
            }
        });

        // Send Welcome Email if requested
        if (req.body.sendEmail) {
            try {
                if (process.env.SMTP_HOST) {
                    await transporter.sendMail({
                        from: `"MineHR System" <${process.env.SMTP_USER || 'noreply@minehr.com'}>`,
                        to: email,
                        subject: 'Welcome to MineHR - Your Account Details',
                        text: `Welcome ${name}!\n\nYour account has been created with role: ${role}.\nYour login password is: ${password}\n\nPlease login at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`,
                        html: `
                            <h2>Welcome to MineHR, ${name}!</h2>
                            <p>Your administrator has created an account for you.</p>
                            <ul>
                                <li><b>Email:</b> ${email}</li>
                                <li><b>Role:</b> ${role}</li>
                                <li><b>Temporary Password:</b> ${password}</li>
                            </ul>
                            <p>Please login and change your password immediately.</p>
                        `
                    });
                } else {
                    console.log(`\n\n=== DEV LOG: WELCOME EMAIL NOT SENT (SMTP UNCONFIGURED). PASSWORD FOR ${email} IS ${password} ===\n\n`);
                }
            } catch (emailErr) {
                console.error('Failed to send welcome email:', emailErr);
            }
        }

        const adminUser = (req as any).user;
        await logActivity(adminUser?.id || null, 'CREATED', 'USER', newUser.name, { role, email });
        res.status(201).json({ message: 'User created successfully', user: { id: newUser.id, name: newUser.name } });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to create user', details: error.message });
    }
});

// Fetch all users for selection (e.g., F&F, Bank Details)
router.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                branch: { select: { name: true } },
                department: { select: { name: true } }
            },
            orderBy: { name: 'asc' }
        });
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
});

// Delete a user
router.delete('/user/:id', async (req, res) => {
    try {
        await prisma.user.delete({
            where: { id: parseInt(req.params.id) }
        });
        const adminUser = (req as any).user;
        await logActivity(adminUser?.id || null, 'DELETED', 'USER', `User #${req.params.id}`);
        res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to delete user', details: error.message });
    }
});

// Admin forced password reset
router.put('/user/:id/password', async (req, res) => {
    const { password } = req.body;
    if (!password) {
        return res.status(400).json({ error: 'New password is required' });
    }
    try {
        const password_hash = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { id: parseInt(req.params.id) },
            data: { password_hash }
        });
        const adminUser = (req as any).user;
        await logActivity(adminUser?.id || null, 'UPDATED', 'USER', `User #${req.params.id}`, { action: 'Password Reset' });
        res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update password', details: error.message });
    }
});

// ==========================================
// Forgot Password & Reset Flow
// ==========================================

// Setup dummy/optional transporter for sending OTPs
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
        user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
        pass: process.env.SMTP_PASS || 'ethereal_password'
    }
});

// 1. Request OTP
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // For security, don't reveal if user exists or not immediately.
            return res.json({ message: 'If this email exists, an OTP has been sent.' });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.user.update({
            where: { email },
            data: {
                resetPasswordOtp: otp,
                resetPasswordOtpExpiry: expiry
            }
        });

        console.log(`\n\n=== DEV LOG: OTP FOR ${email} IS ${otp} ===\n\n`);

        // Attempt to send email, but don't crash if SMTP is unconfigured
        try {
            if (process.env.SMTP_HOST) {
                await transporter.sendMail({
                    from: `"MineHR System" <${process.env.SMTP_USER || 'noreply@minehr.com'}>`,
                    to: email,
                    subject: 'MineHR - Password Reset OTP',
                    text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
                    html: `<b>Your OTP for password reset is:</b> <h1>${otp}</h1><p>It is valid for 10 minutes.</p>`
                });
            }
        } catch (emailErr) {
            console.error('Failed to send email (SMTP likely unconfigured):', emailErr);
        }

        await logActivity(user.id, 'REQUESTED', 'PASSWORD_RESET', 'User requested password reset OTP');
        res.json({ message: 'OTP generated and sent successfully.' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to process forgot password request', details: error.message });
    }
});

// 2. Verify OTP only
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.resetPasswordOtp !== otp) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        if (!user.resetPasswordOtpExpiry || user.resetPasswordOtpExpiry < new Date()) {
            return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
        }

        res.json({ message: 'OTP verified successfully. Proceed to reset password.' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to verify OTP', details: error.message });
    }
});

// 3. Reset Password
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.resetPasswordOtp !== otp) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        if (!user.resetPasswordOtpExpiry || user.resetPasswordOtpExpiry < new Date()) {
            return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
        }

        const password_hash = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email },
            data: {
                password_hash,
                resetPasswordOtp: null,
                resetPasswordOtpExpiry: null
            }
        });

        await logActivity(user.id, 'UPDATED', 'USER', 'User successfully reset their password via OTP');
        res.json({ message: 'Password has been reset successfully. You can now login.' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to reset password', details: error.message });
    }
});

// 1. Request OTP for Login
router.post('/send-login-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.user.update({
            where: { email },
            data: {
                resetPasswordOtp: otp,
                resetPasswordOtpExpiry: expiry
            }
        });

        console.log(`\n\n=== DEV LOG: LOGIN OTP FOR ${email} IS ${otp} ===\n\n`);

        if (process.env.SMTP_HOST) {
            await transporter.sendMail({
                from: `"MineHR System" <${process.env.SMTP_USER || 'noreply@minehr.com'}>`,
                to: email,
                subject: 'MineHR - Login OTP',
                text: `Your OTP for login is: ${otp}. It is valid for 10 minutes.`,
                html: `<b>Your OTP for login is:</b> <h1>${otp}</h1><p>It is valid for 10 minutes.</p>`
            });
        }

        await logActivity(user.id, 'REQUESTED', 'LOGIN_OTP', 'User requested login OTP');
        res.json({ message: 'OTP sent successfully.' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to send login OTP', details: error.message });
    }
});

// 2. Login with OTP
router.post('/login-with-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    try {
        const user = await prisma.user.findUnique({ 
            where: { email },
            include: { mobileDevice: true }
        });

        if (!user || user.resetPasswordOtp !== otp) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        if (!user.resetPasswordOtpExpiry || user.resetPasswordOtpExpiry < new Date()) {
            return res.status(400).json({ error: 'OTP has expired' });
        }

        // --- Mobile Device Binding Logic ---
        const { deviceId, deviceName, macAddress } = req.body;
        if (deviceId || macAddress) {
            const currentReqId = deviceId || macAddress;
            const currentReqName = deviceName || 'Unknown Mobile Device';
            
            if (user.mobileDevice) {
                if (user.mobileDevice.status === 'Bound') {
                    if (!user.mobileDevice.isActive) {
                        return res.status(403).json({ error: 'App access has been disabled for your account.' });
                    }
                    const registeredId = user.mobileDevice.deviceId || user.mobileDevice.macAddress;
                    if (registeredId && registeredId !== currentReqId) {
                        return res.status(403).json({ error: 'Unauthorized device. Please login from your registered mobile device.' });
                    }
                    await prisma.mobileDevice.update({
                        where: { userId: user.id },
                        data: { lastLoginAt: new Date() }
                    });
                } else if (user.mobileDevice.status === 'Unbound') {
                    await prisma.mobileDevice.update({
                        where: { userId: user.id },
                        data: {
                            deviceId: deviceId || null,
                            macAddress: macAddress || null,
                            deviceName: currentReqName,
                            status: 'Bound',
                            isActive: true,
                            lastLoginAt: new Date()
                        }
                    });
                }
            } else {
                await prisma.mobileDevice.create({
                    data: {
                        userId: user.id,
                        deviceId: deviceId || null,
                        macAddress: macAddress || null,
                        deviceName: currentReqName,
                        status: 'Bound',
                        isActive: true,
                        lastLoginAt: new Date()
                    }
                });
            }
        }
        // -----------------------------------

        // Clear OTP
        await prisma.user.update({
            where: { id: user.id },
            data: { resetPasswordOtp: null, resetPasswordOtpExpiry: null }
        });

        // Generate JWT Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            getJWTSecret(),
            { expiresIn: '1d' }
        );

        await logActivity(user.id, 'LOGIN', 'USER', 'User logged in via OTP');
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: (user as any).permissions
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to login with OTP', details: error.message });
    }
});

export default router;
