import { PrismaClient, Gender } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Seed Data for Cupid AI...');

  // 1. Seed Interests
  const interests = [
    { id: 1, name: 'Âm nhạc', iconName: 'musical-notes', category: 'Nghệ thuật' },
    { id: 2, name: 'Du lịch', iconName: 'airplane', category: 'Lối sống' },
    { id: 3, name: 'Đọc sách', iconName: 'book', category: 'Học tập' },
    { id: 4, name: 'Nấu ăn', iconName: 'restaurant', category: 'Ẩm thực' },
    { id: 5, name: 'Xem phim', iconName: 'film', category: 'Giải trí' },
    { id: 6, name: 'Nhiếp ảnh', iconName: 'camera', category: 'Nghệ thuật' },
    { id: 7, name: 'Thể thao / Gym', iconName: 'fitness', category: 'Sức khỏe' },
    { id: 8, name: 'Nuôi mèo', iconName: 'paw', category: 'Thú cưng' },
    { id: 9, name: 'Cà phê chuyện trò', iconName: 'cafe', category: 'Lối sống' },
    { id: 10, name: 'Lập trình / Công nghệ', iconName: 'code-slash', category: 'Sở thích' },
  ];

  for (const item of interests) {
    await prisma.interest.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }
  console.log(`✅ Seeded ${interests.length} interests.`);

  // 2. Seed 20 Demo Users (Hanoi University Students across districts)
  const defaultPasswordHash = await bcrypt.hash('MatKhau123@', 10);

  const sampleUsers = [
    {
      email: 'linh.tran@test.com',
      fullName: 'Trần Mai Linh',
      gender: Gender.FEMALE,
      birthDate: new Date('2002-05-14'),
      heightCm: 162,
      bio: 'Sinh viên Ngoại thương thích những chiều hoàng hôn nghe nhạc Indie và một ly trà sữa ít đường.',
      mbtiType: 'ENFP',
      dailyMood: 'Thèm trà sữa',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
      photos: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
      ],
      latitude: 21.0285, // Hoàn Kiếm
      longitude: 105.8544,
      interestIds: [1, 2, 8, 9],
    },
    {
      email: 'hoang.nguyen@test.com',
      fullName: 'Nguyễn Huy Hoàng',
      gender: Gender.MALE,
      birthDate: new Date('2001-11-20'),
      heightCm: 178,
      bio: 'Coder Bách Khoa hướng nội thích đọc sách khoa học và dạo phố đêm Hà Nội.',
      mbtiType: 'INFP',
      dailyMood: 'Cần người đi dạo',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
      photos: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
      ],
      latitude: 21.0055, // Hai Bà Trưng (Bách Khoa)
      longitude: 105.8433,
      interestIds: [3, 9, 10],
    },
    {
      email: 'huong.le@test.com',
      fullName: 'Lê Thu Hương',
      gender: Gender.FEMALE,
      birthDate: new Date('2003-02-18'),
      heightCm: 165,
      bio: 'Tìm kiếm người bạn cùng gu xem phim cuối tuần và đi bảo tàng mỹ thuật.',
      mbtiType: 'INFJ',
      dailyMood: 'Xem phim cuối tuần',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500',
      photos: [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500',
      ],
      latitude: 21.0225, // Đống Đa
      longitude: 105.8185,
      interestIds: [4, 5, 6, 9],
    },
    {
      email: 'minh.duc@test.com',
      fullName: 'Phạm Minh Đức',
      gender: Gender.MALE,
      birthDate: new Date('2002-08-09'),
      heightCm: 182,
      bio: 'Dân Kinh Tế Quốc Dân, đam mê tập gym, bóng rổ và thích nấu ăn cuối tuần.',
      mbtiType: 'ENTJ',
      dailyMood: 'Tập gym chung',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
      photos: [
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
      ],
      latitude: 21.0035, // Hai Bà Trưng (KTQD)
      longitude: 105.8415,
      interestIds: [4, 7, 9],
    },
    {
      email: 'ngoc.anh@test.com',
      fullName: 'Vũ Ngọc Ánh',
      gender: Gender.FEMALE,
      birthDate: new Date('2003-07-25'),
      heightCm: 160,
      bio: 'Sinh viên Mỹ Thuật Công Nghiệp, thích chụp ảnh film và nuôi 2 bé mèo béo.',
      mbtiType: 'ISFP',
      dailyMood: 'Đang yêu đời',
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500',
      photos: [
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500',
      ],
      latitude: 21.0210, // Đống Đa
      longitude: 105.8245,
      interestIds: [1, 6, 8],
    },
    {
      email: 'tuan.kiet@test.com',
      fullName: 'Đỗ Tuấn Kiệt',
      gender: Gender.MALE,
      birthDate: new Date('2000-12-10'),
      heightCm: 175,
      bio: 'Lập trình viên Mobile, thích nghe Podcast về công nghệ và du lịch phượt bụi.',
      mbtiType: 'INTP',
      dailyMood: 'Cà phê chuyện trò',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500',
      photos: [
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500',
      ],
      latitude: 21.0360, // Cầu Giấy
      longitude: 105.7905,
      interestIds: [2, 9, 10],
    },
    {
      email: 'phuong.thao@test.com',
      fullName: 'Ngô Phương Thảo',
      gender: Gender.FEMALE,
      birthDate: new Date('2002-10-04'),
      heightCm: 163,
      bio: 'Học Y Hà Nội nhưng tâm hồn dành cho âm nhạc acoustic và dạo mát Hồ Tây.',
      mbtiType: 'ENFJ',
      dailyMood: 'Cần người đi dạo',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
      photos: [
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
      ],
      latitude: 21.0583, // Tây Hồ
      longitude: 105.8236,
      interestIds: [1, 2, 9],
    },
    {
      email: 'quoc.bao@test.com',
      fullName: 'Trần Quốc Bảo',
      gender: Gender.MALE,
      birthDate: new Date('2001-04-15'),
      heightCm: 176,
      bio: 'Guitarist bán thời gian, mê ban nhạc Ngọt và thích đi tìm các quán phở đêm ngon.',
      mbtiType: 'ENTP',
      dailyMood: 'Đi ăn đêm',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500',
      photos: [
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500',
      ],
      latitude: 21.0335, // Ba Đình
      longitude: 105.8345,
      interestIds: [1, 4, 9],
    },
    {
      email: 'ha.my@test.com',
      fullName: 'Đặng Hà My',
      gender: Gender.FEMALE,
      birthDate: new Date('2004-01-20'),
      heightCm: 158,
      bio: 'Năm nhất ĐH Hà Nội, thích học ngoại ngữ, đọc manga và làm bánh ngọt.',
      mbtiType: 'ISFJ',
      dailyMood: 'Học bài cùng',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500',
      photos: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500',
      ],
      latitude: 20.9965, // Thanh Xuân
      longitude: 105.8055,
      interestIds: [3, 4, 5],
    },
    {
      email: 'viet.anh@test.com',
      fullName: 'Bùi Việt Anh',
      gender: Gender.MALE,
      birthDate: new Date('2002-03-30'),
      heightCm: 180,
      bio: 'Kiến Trúc Hà Đông, thích vẽ phác thảo phố cổ và chụp ảnh phim đen trắng.',
      mbtiType: 'ISTP',
      dailyMood: 'Cà phê chuyện trò',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500',
      photos: [
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500',
      ],
      latitude: 20.9805, // Hà Đông
      longitude: 105.7875,
      interestIds: [2, 6, 9],
    },
    {
      email: 'thanh.truc@test.com',
      fullName: 'Lương Thanh Trúc',
      gender: Gender.FEMALE,
      birthDate: new Date('2003-09-12'),
      heightCm: 164,
      bio: 'Dân Luật thích tranh biện nhưng ngoài đời khá hiền lành và yêu động vật.',
      mbtiType: 'INTJ',
      dailyMood: 'Đang yêu đời',
      avatarUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500',
      photos: [
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500',
      ],
      latitude: 21.0185, // Đống Đa (ĐH Luật)
      longitude: 105.8125,
      interestIds: [3, 8, 9],
    },
    {
      email: 'nam.khanh@test.com',
      fullName: 'Hoàng Nam Khánh',
      gender: Gender.MALE,
      birthDate: new Date('2001-06-22'),
      heightCm: 174,
      bio: 'Sinh viên Báo chí, thích xem phim tài liệu, viết lách và khám phá quán ăn mới.',
      mbtiType: 'ENFP',
      dailyMood: 'Xem phim cuối tuần',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500',
      photos: [
        'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500',
      ],
      latitude: 21.0375, // Cầu Giấy (Học viện Báo chí)
      longitude: 105.7865,
      interestIds: [2, 5, 6],
    },
    {
      email: 'quynh.chi@test.com',
      fullName: 'Phan Quỳnh Chi',
      gender: Gender.FEMALE,
      birthDate: new Date('2002-11-05'),
      heightCm: 166,
      bio: 'Thích chạy bộ buổi sáng ở công viên Thống Nhất và uống cà phê trứng.',
      mbtiType: 'ESFJ',
      dailyMood: 'Tập gym chung',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500',
      photos: [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500',
      ],
      latitude: 21.0125, // Hai Bà Trưng
      longitude: 105.8455,
      interestIds: [7, 9],
    },
    {
      email: 'duy.khoi@test.com',
      fullName: 'Trịnh Duy Khôi',
      gender: Gender.MALE,
      birthDate: new Date('2003-08-14'),
      heightCm: 177,
      bio: 'Dân Công nghệ thông tin ĐHQGHN, thích chơi cờ vua, game indie và làm AI projects.',
      mbtiType: 'INTJ',
      dailyMood: 'Học bài cùng',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500',
      photos: [
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500',
      ],
      latitude: 21.0380, // Cầu Giấy (ĐHQGHN)
      longitude: 105.7820,
      interestIds: [3, 10],
    },
    {
      email: 'bao.tram@test.com',
      fullName: 'Nguyễn Bảo Trâm',
      gender: Gender.FEMALE,
      birthDate: new Date('2002-04-19'),
      heightCm: 161,
      bio: 'Thích cắm hoa, đi chợ hoa Quảng Bá lúc rạng sáng và nghe podcast chữa lành.',
      mbtiType: 'INFP',
      dailyMood: 'Cần người đi dạo',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
      photos: [
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
      ],
      latitude: 21.0620, // Tây Hồ (Quảng Bá)
      longitude: 105.8270,
      interestIds: [1, 3, 8],
    },
    {
      email: 'khanh.linh@test.com',
      fullName: 'Vũ Khánh Linh',
      gender: Gender.FEMALE,
      birthDate: new Date('2001-09-08'),
      heightCm: 167,
      bio: 'Học Thạc sĩ Marketing, gu phim trinh thám và thích nấu những bữa cơm gia đình ấm cúng.',
      mbtiType: 'ENTJ',
      dailyMood: 'Xem phim cuối tuần',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
      photos: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
      ],
      latitude: 21.0250, // Hoàn Kiếm
      longitude: 105.8510,
      interestIds: [4, 5, 9],
    },
    {
      email: 'thai.son@test.com',
      fullName: 'Lê Thái Sơn',
      gender: Gender.MALE,
      birthDate: new Date('2002-02-11'),
      heightCm: 181,
      bio: 'Vận động viên bơi lội trường thể thao, thích khám phá ẩm thực đường phố và camping.',
      mbtiType: 'ESTP',
      dailyMood: 'Đi ăn đêm',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
      photos: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
      ],
      latitude: 21.0310, // Ba Đình
      longitude: 105.8290,
      interestIds: [2, 7, 9],
    },
    {
      email: 'minh.anh@test.com',
      fullName: 'Trần Minh Anh',
      gender: Gender.OTHER,
      birthDate: new Date('2003-05-30'),
      heightCm: 168,
      bio: 'Designer tự do, thích phong cách vintage, nhạc indie và yêu mến những tâm hồn tự do.',
      mbtiType: 'INFP',
      dailyMood: 'Cà phê chuyện trò',
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500',
      photos: [
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500',
      ],
      latitude: 21.0295, // Hoàn Kiếm
      longitude: 105.8490,
      interestIds: [1, 6, 9],
    },
    {
      email: 'hai.yen@test.com',
      fullName: 'Hoàng Hải Yến',
      gender: Gender.FEMALE,
      birthDate: new Date('2002-12-03'),
      heightCm: 163,
      bio: 'Dược sĩ tương lai, thích làm nến thơm, đọc sách tâm lý học và ngắm mưa bên cửa sổ.',
      mbtiType: 'ISFJ',
      dailyMood: 'Thèm trà sữa',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500',
      photos: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500',
      ],
      latitude: 21.0080, // Hai Bà Trưng
      longitude: 105.8560,
      interestIds: [3, 8, 9],
    },
    {
      email: 'tien.dung@test.com',
      fullName: 'Nguyễn Tiến Dũng',
      gender: Gender.MALE,
      birthDate: new Date('2001-07-17'),
      heightCm: 179,
      bio: 'Kỹ sư cầu đường yêu nghệ thuật và ẩm thực, thích những buổi tối lang thang trà chanh Nhà Thờ.',
      mbtiType: 'ESFP',
      dailyMood: 'Cần người đi dạo',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
      photos: [
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
      ],
      latitude: 21.0280, // Hoàn Kiếm (Nhà Thờ Lớn)
      longitude: 105.8495,
      interestIds: [2, 4, 9],
    },
  ];

  for (const u of sampleUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        passwordHash: defaultPasswordHash,
        isVerified: true,
      },
      update: {},
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fullName: u.fullName,
        gender: u.gender,
        birthDate: u.birthDate,
        heightCm: u.heightCm,
        bio: u.bio,
        mbtiType: u.mbtiType,
        dailyMood: u.dailyMood,
        moodUpdatedAt: new Date(),
        avatarUrl: u.avatarUrl,
        photos: u.photos,
        latitude: u.latitude,
        longitude: u.longitude,
      },
      update: {
        fullName: u.fullName,
        gender: u.gender,
        birthDate: u.birthDate,
        heightCm: u.heightCm,
        bio: u.bio,
        mbtiType: u.mbtiType,
        dailyMood: u.dailyMood,
        moodUpdatedAt: new Date(),
        avatarUrl: u.avatarUrl,
        photos: u.photos,
        latitude: u.latitude,
        longitude: u.longitude,
      },
    });

    for (const interestId of u.interestIds) {
      await prisma.userInterest.upsert({
        where: {
          userId_interestId: {
            userId: user.id,
            interestId,
          },
        },
        create: {
          userId: user.id,
          interestId,
        },
        update: {},
      });
    }
  }

  console.log(`✅ Seeded ${sampleUsers.length} sample users with complete profiles.`);
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
