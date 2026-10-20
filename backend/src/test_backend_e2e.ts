import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { ENV } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { setupChatSockets } from './sockets/chat.socket.js';

import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import discoveryRoutes from './routes/discovery.routes.js';
import swipeRoutes from './routes/swipe.routes.js';
import chatRoutes from './routes/chat.routes.js';
import aiRoutes from './routes/ai.routes.js';
import { prisma } from './config/prisma.js';
import { setSocketIO } from './config/socket.js';

async function runE2ETests() {
  console.log('🧪 Starting Backend End-to-End Test Suite...\n');

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });
  setSocketIO(io);

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'online' });
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/profile', profileRoutes);
  app.use('/api/v1/discovery', discoveryRoutes);
  app.use('/api/v1/swipes', swipeRoutes);
  app.use('/api/v1/chat', chatRoutes);
  app.use('/api/v1/ai', aiRoutes);

  setupChatSockets(io);
  app.use(errorHandler);

  const TEST_PORT = 5055;
  await new Promise<void>((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`📡 Test server running on http://localhost:${TEST_PORT}\n`);

  const BASE_URL = `http://localhost:${TEST_PORT}/api/v1`;

  let userToken = '';
  let refreshToken = '';
  let userId = '';
  const testEmail = `test.e2e.${Date.now()}@example.com`;
  const testPassword = 'Password123@';

  try {
    // 1. Health Check
    console.log('1. Testing Health Check...');
    const healthRes = await fetch(`http://localhost:${TEST_PORT}/api/health`);
    const healthData: any = await healthRes.json();
    if (healthData.status !== 'online') throw new Error('Health check failed');
    console.log('✅ Health check passed.');

    // 2. Register
    console.log('2. Testing Registration...');
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    const regData: any = await regRes.json();
    if (!regRes.ok || !regData.success) throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    console.log('✅ Registration passed (OTP dispatched).');

    // 3. Verify OTP (using dev bypass code '123456')
    console.log('3. Testing OTP Verification & Dual Token Issuance...');
    const otpRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otpCode: '123456' }),
    });
    const otpData: any = await otpRes.json();
    if (!otpRes.ok || !otpData.accessToken || !otpData.refreshToken) {
      throw new Error(`OTP verification failed: ${JSON.stringify(otpData)}`);
    }
    userToken = otpData.accessToken;
    refreshToken = otpData.refreshToken;
    userId = otpData.user.id;
    console.log('✅ OTP Verification passed (accessToken & refreshToken received).');

    // 4. Refresh Token
    console.log('4. Testing Token Refresh...');
    const refreshRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const refreshData: any = await refreshRes.json();
    if (!refreshRes.ok || !refreshData.accessToken) {
      throw new Error(`Refresh token failed: ${JSON.stringify(refreshData)}`);
    }
    userToken = refreshData.accessToken;
    console.log('✅ Refresh token passed.');

    // 5. Get Interests List
    console.log('5. Testing Get Interests...');
    const interestsRes = await fetch(`${BASE_URL}/profile/interests`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const interestsData: any = await interestsRes.json();
    if (!interestsRes.ok || !interestsData.interests || interestsData.interests.length < 5) {
      throw new Error(`Get interests failed: ${JSON.stringify(interestsData)}`);
    }
    console.log(`✅ Get interests passed (${interestsData.count} interests found).`);

    // 6. Setup Profile
    console.log('6. Testing Profile Creation...');
    const profileRes = await fetch(`${BASE_URL}/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        fullName: 'Kiểm Thử Viên E2E',
        gender: 'MALE',
        birthDate: '2001-05-15',
        bio: 'Hồ sơ kiểm thử hệ thống tự động.',
        heightCm: 175,
        interestIds: [1, 2, 3],
        latitude: 21.0285, // Hoan Kiem
        longitude: 105.8544,
      }),
    });
    const profileData: any = await profileRes.json();
    if (!profileRes.ok || !profileData.success) {
      throw new Error(`Profile setup failed: ${JSON.stringify(profileData)}`);
    }
    console.log('✅ Profile setup passed.');

    // 7. Update MBTI
    console.log('7. Testing Update MBTI...');
    const mbtiRes = await fetch(`${BASE_URL}/profile/mbti`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ mbtiType: 'INTJ' }),
    });
    const mbtiData: any = await mbtiRes.json();
    if (!mbtiRes.ok || mbtiData.mbtiType !== 'INTJ') throw new Error('Update MBTI failed');
    console.log('✅ Update MBTI passed.');

    // 8. Update Daily Mood
    console.log('8. Testing Update Mood...');
    const moodRes = await fetch(`${BASE_URL}/profile/mood`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ dailyMood: 'Thèm trà sữa' }),
    });
    const moodData: any = await moodRes.json();
    if (!moodRes.ok || moodData.dailyMood !== 'Thèm trà sữa') throw new Error('Update Mood failed');
    console.log('✅ Update Mood passed.');

    // 9. Update Preferences (Max Distance, Age Range)
    console.log('9. Testing Update Preferences...');
    const prefRes = await fetch(`${BASE_URL}/profile/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ maxDistanceKm: 60, ageMin: 18, ageMax: 30 }),
    });
    const prefData: any = await prefRes.json();
    if (!prefRes.ok || !prefData.success) throw new Error('Update preferences failed');
    console.log('✅ Update preferences passed.');

    // 10. Upload Photo
    console.log('10. Testing Photo Upload...');
    const uploadRes = await fetch(`${BASE_URL}/profile/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
        isAvatar: true,
      }),
    });
    const uploadData: any = await uploadRes.json();
    if (!uploadRes.ok || !uploadData.url) throw new Error('Upload photo failed');
    console.log('✅ Photo upload passed.');

    // 11. Discovery Feed
    console.log('11. Testing Discovery Feed with Filters...');
    const feedRes = await fetch(`${BASE_URL}/discovery/feed?gender=FEMALE`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const feedData: any = await feedRes.json();
    if (!feedRes.ok || !Array.isArray(feedData.feed)) throw new Error('Discovery feed failed');
    console.log(`✅ Discovery feed passed (${feedData.count} candidates retrieved).`);

    const candidate = feedData.feed[0];
    if (!candidate) throw new Error('No candidate found in seed data feed!');

    // 12. Get Candidate Public Profile by ID
    console.log(`12. Testing Public Profile View for user ${candidate.id}...`);
    const publicProfileRes = await fetch(`${BASE_URL}/profile/user/${candidate.id}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const publicProfileData: any = await publicProfileRes.json();
    if (!publicProfileRes.ok || !publicProfileData.profile) throw new Error('Public profile view failed');
    console.log(`✅ Public profile view passed: ${publicProfileData.profile.fullName} (${publicProfileData.profile.age} tuổi)`);

    // 13. Swipe Right (LIKE) candidate
    console.log(`13. Testing Swipe Right on candidate ${candidate.fullName}...`);
    const swipe1Res = await fetch(`${BASE_URL}/swipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ targetUserId: candidate.id, action: 'LIKE' }),
    });
    const swipe1Data: any = await swipe1Res.json();
    if (!swipe1Res.ok || swipe1Data.matched !== false) throw new Error('1-way swipe should not match yet');
    console.log('✅ 1-way swipe recorded.');

    // 14. Candidate swipes back to create MATCH
    console.log('14. Simulating reciprocal swipe to create Match...');
    // Create candidate token
    const candidateUser = await prisma.user.findUnique({ where: { id: candidate.id } });
    if (!candidateUser) throw new Error('Candidate user not found');
    const candidateSwipeRes = await prisma.swipe.upsert({
      where: {
        swiperId_targetId: {
          swiperId: candidate.id,
          targetId: userId,
        },
      },
      create: { swiperId: candidate.id, targetId: userId, action: 'LIKE' },
      update: { action: 'LIKE' },
    });

    // Swiping again as current user should now detect MATCH
    const swipe2Res = await fetch(`${BASE_URL}/swipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ targetUserId: candidate.id, action: 'LIKE' }),
    });
    const swipe2Data: any = await swipe2Res.json();
    if (!swipe2Res.ok || !swipe2Data.matched || !swipe2Data.conversationId) {
      throw new Error(`Match creation failed: ${JSON.stringify(swipe2Data)}`);
    }
    console.log(`✅ It's a Match! (Match ID: ${swipe2Data.matchId}, Conv ID: ${swipe2Data.conversationId})`);

    const convId = swipe2Data.conversationId;
    const matchId = swipe2Data.matchId;

    // 15. AI Icebreaker Generation (Testing with matchId)
    console.log('15. Testing AI Icebreaker with matchId...');
    const aiRes1 = await fetch(`${BASE_URL}/ai/icebreaker`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ matchId }),
    });
    const aiData1: any = await aiRes1.json();
    if (!aiRes1.ok || !aiData1.icebreakers || aiData1.icebreakers.length !== 3) {
      throw new Error(`AI Icebreaker failed: ${JSON.stringify(aiData1)}`);
    }
    console.log(`✅ AI Icebreaker (by matchId) passed: 3 styles received: "${aiData1.icebreakers[0].style}", "${aiData1.icebreakers[1].style}", "${aiData1.icebreakers[2].style}"`);

    // 16. AI Icebreaker Generation (Testing with conversationId - Mobile Bug fix verification!)
    console.log('16. Testing AI Icebreaker with conversationId (Validating mobile bug fix)...');
    const aiRes2 = await fetch(`${BASE_URL}/ai/icebreaker`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ matchId: convId }), // passing conversationId as matchId like Mobile does!
    });
    const aiData2: any = await aiRes2.json();
    if (!aiRes2.ok || !aiData2.icebreakers || aiData2.icebreakers.length !== 3) {
      throw new Error(`AI Icebreaker via conversationId failed: ${JSON.stringify(aiData2)}`);
    }
    console.log('✅ AI Icebreaker via conversationId passed! (Mobile navigation bug permanently solved).');

    // 17. Conversations List
    console.log('17. Testing Get Conversations...');
    const convsRes = await fetch(`${BASE_URL}/chat/conversations`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const convsData: any = await convsRes.json();
    if (!convsRes.ok || convsData.conversations.length === 0) throw new Error('Get conversations failed');
    console.log(`✅ Get conversations passed (${convsData.conversations.length} active conversations).`);

    // 18. Send Message and Fetch Messages
    console.log('18. Testing Message Persistence & History...');
    await prisma.message.create({
      data: {
        conversationId: convId,
        senderId: candidate.id,
        content: 'Chào bạn! Rất vui được làm quen với bạn trên Cupid AI.',
      },
    });
    const msgRes = await fetch(`${BASE_URL}/chat/conversations/${convId}/messages`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const msgData: any = await msgRes.json();
    if (!msgRes.ok || msgData.messages.length === 0) throw new Error('Get messages failed');
    console.log(`✅ Get messages passed (${msgData.messages.length} messages retrieved).`);

    // 19. Mark Messages as Read
    console.log('19. Testing Mark Messages as Read...');
    const readRes = await fetch(`${BASE_URL}/chat/conversations/${convId}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const readData: any = await readRes.json();
    if (!readRes.ok || !readData.success) throw new Error('Mark read failed');
    console.log('✅ Mark messages as read passed.');

    // 20. Unmatch
    console.log('20. Testing Unmatch...');
    const unmatchRes = await fetch(`${BASE_URL}/chat/unmatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ matchId }),
    });
    const unmatchData: any = await unmatchRes.json();
    if (!unmatchRes.ok || !unmatchData.success) throw new Error('Unmatch failed');
    console.log('✅ Unmatch passed.');

    // 21. Forgot Password & Reset Password
    console.log('21. Testing Forgot Password & Reset Password...');
    const forgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    const forgotData: any = await forgotRes.json();
    if (!forgotRes.ok || !forgotData.success) throw new Error('Forgot password failed');

    const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        otpCode: '123456', // Dev bypass code
        newPassword: 'NewPassword456@',
      }),
    });
    const resetData: any = await resetRes.json();
    if (!resetRes.ok || !resetData.success) throw new Error('Reset password failed');
    console.log('✅ Forgot password & Reset password passed.');

    // 22. Login with New Password
    console.log('22. Testing Login with New Password...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'NewPassword456@' }),
    });
    const loginData: any = await loginRes.json();
    if (!loginRes.ok || !loginData.accessToken || !loginData.refreshToken) {
      throw new Error('Login with new password failed');
    }
    console.log('✅ Login with new password passed.');

    // 23. Change Password
    console.log('23. Testing Authenticated Change Password...');
    const changeRes = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginData.accessToken}`,
      },
      body: JSON.stringify({
        oldPassword: 'NewPassword456@',
        newPassword: 'FinalPassword789@',
      }),
    });
    const changeData: any = await changeRes.json();
    if (!changeRes.ok || !changeData.success) throw new Error('Change password failed');
    console.log('✅ Change password passed.');

    console.log('\n======================================================');
    console.log('🎉 ALL 23 BACKEND MODULE END-TO-END TESTS PASSED 100%!');
    console.log('======================================================\n');
  } catch (err: any) {
    console.error('\n❌ E2E Test Failure:', err.message);
    process.exitCode = 1;
  } finally {
    // Cleanup test user
    try {
      if (userId) {
        await prisma.user.delete({ where: { id: userId } });
        console.log('🧹 Cleaned up temporary test user record.');
      }
    } catch (_) {}
    server.close();
    await prisma.$disconnect();
  }
}

runE2ETests();
