import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import College from '@/models/College';
import Ticket from '@/models/Ticket';
import Sponsor from '@/models/Sponsor';
import InfluencerCoupon from '@/models/InfluencerCoupon';
import bcrypt from 'bcryptjs';
import { participantSchema } from '@/lib/validation';
import { sendRegistrationEmail } from '@/lib/email';

export async function POST(req: Request) {
    await dbConnect();

    try {
        const body = await req.json();
        const {
            name, email, password, role, phone,
            // Participant specific
            collegeId, couponCode, teamType, teamName, teamMembers,
            category, projectTitle, projectDescription, projectLinks, skillVerification,
            // Sponsor/Delegate specific
            companyName, designation, tier
        } = body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        let userData: any = {
            name,
            email,
            password, // Will be hashed by pre-save hook
            role,
            phone,
        };

        let ticketPrice = 0;
        let discount = 0;
        let finalPrice = 0;
        let appliedCoupon = null;
        let couponType = null;

        if (role === 'Participant') {
            // Validate participant data
            const validationResult = participantSchema.safeParse(body);
            if (!validationResult.success) {
                console.error('Validation Errors:', validationResult.error.flatten().fieldErrors);
                return NextResponse.json({
                    message: 'Validation failed',
                    errors: validationResult.error.flatten().fieldErrors
                }, { status: 400 });
            }

            ticketPrice = 1800;

            // Add participant-specific fields
            userData.collegeId = collegeId;
            userData.teamType = teamType;
            userData.teamName = teamName;
            userData.teamMembers = teamMembers;
            userData.category = category;
            userData.projectTitle = projectTitle;
            userData.projectDescription = projectDescription;
            userData.projectLinks = projectLinks;
            userData.skillVerification = skillVerification;

            // Coupon validation logic
            if (couponCode) {
                // First, check if it's a college coupon
                const college = await College.findOne({ code: couponCode });
                if (college) {
                    // Validate that the coupon matches the selected college
                    if (college._id.toString() !== collegeId) {
                        return NextResponse.json({
                            message: 'College coupon code does not match selected college'
                        }, { status: 400 });
                    }
                    discount = college.discountAmount;
                    appliedCoupon = couponCode;
                    couponType = 'College';
                    userData.couponUsed = couponCode;
                } else {
                    // Check if it's an influencer coupon
                    const influencerCoupon = await InfluencerCoupon.findOne({
                        code: couponCode,
                        isActive: true
                    });

                    if (influencerCoupon) {
                        // Check expiry
                        if (influencerCoupon.expiryDate && new Date() > influencerCoupon.expiryDate) {
                            return NextResponse.json({
                                message: 'Coupon has expired'
                            }, { status: 400 });
                        }

                        // Check usage limit
                        if (influencerCoupon.usageLimit && influencerCoupon.usedCount >= influencerCoupon.usageLimit) {
                            return NextResponse.json({
                                message: 'Coupon usage limit reached'
                            }, { status: 400 });
                        }

                        discount = influencerCoupon.discountAmount;
                        appliedCoupon = couponCode;
                        couponType = 'Influencer';
                        userData.couponUsed = couponCode;

                        // Increment usage count
                        influencerCoupon.usedCount += 1;
                        await influencerCoupon.save();
                    } else {
                        return NextResponse.json({
                            message: 'Invalid coupon code'
                        }, { status: 400 });
                    }
                }
            }

            finalPrice = ticketPrice - discount;

            // Update college earnings logic
            if (collegeId) {
                const college = await College.findById(collegeId);
                if (college) {
                    // If coupon was used (either college or influencer), college earns 0
                    // If no coupon, college earns 600
                    const collegeEarning = appliedCoupon ? 0 : 600;

                    college.earnings = (college.earnings || 0) + collegeEarning;
                    college.registrations = (college.registrations || 0) + 1;
                    await college.save();
                }
            }

        } else if (role === 'Delegate') {
            finalPrice = 0; // Delegates typically get free entry
            userData.companyName = companyName;
            userData.designation = designation;
        } else if (role === 'Sponsor') {
            userData.companyName = companyName;
        }

        // Create User
        const newUser = await User.create(userData);

        // Create Ticket (for Participants and Delegates)
        if (role === 'Participant' || role === 'Delegate') {
            const ticket = await Ticket.create({
                userId: newUser._id,
                type: role,
                price: finalPrice,
                status: 'Valid', // In production, this would be 'Pending' until payment
                qrCodeData: `${newUser._id}-${Date.now()}`, // Simple unique string for QR
            });

            // Update user with QR code
            newUser.qrCode = ticket.qrCodeData;
            newUser.paymentStatus = 'Completed'; // In production, this would be 'Pending'
            await newUser.save();

            // Send confirmation email
            await sendRegistrationEmail({
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                ticketId: ticket._id.toString(),
                userId: newUser._id.toString(),
                qrCodeData: ticket.qrCodeData,
                finalPrice,
                discount,
                couponType: couponType || undefined
            });
        }

        if (role === 'Sponsor') {
            await Sponsor.create({
                name: companyName,
                tier: tier,
                contactInfo: { email, phone },
                userId: newUser._id
            });
        }

        return NextResponse.json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role,
                qrCode: newUser.qrCode
            },
            ticket: {
                price: finalPrice,
                discount: discount,
                couponType: couponType
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('Registration error:', error);
        console.error('Error stack:', error.stack);
        return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
    }
}
