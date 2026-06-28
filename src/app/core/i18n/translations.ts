/**
 * Flat key -> { en, ar } translation dictionary, consumed by `TranslatePipe`.
 *
 * Namespacing convention: "<area>.<key>" (e.g. "sidebar.home",
 * "courses.enroll"). Keep keys grouped by the page/component they belong
 * to so they're easy to find and extend.
 */
export const TRANSLATIONS: Record<string, { en: string; ar: string }> = {
  'nav.about': { en: 'About Us', ar: 'من نحن' },
  // ---------------- common / shared ----------------
  'common.save': { en: 'Save Changes', ar: 'حفظ التغييرات' },
  'common.cancel': { en: 'Cancel', ar: 'إلغاء' },
  'common.edit': { en: 'Edit', ar: 'تعديل' },
  'common.retry': { en: 'Retry', ar: 'إعادة المحاولة' },
  'common.loading': { en: 'Loading...', ar: 'جارٍ التحميل...' },
  'common.search': { en: 'Search', ar: 'بحث' },
  'common.submit': { en: 'Submit', ar: 'إرسال' },
  'common.close': { en: 'Close', ar: 'إغلاق' },
  'common.signIn': { en: 'Sign In', ar: 'تسجيل الدخول' },

  // ---------------- sidebar ----------------
  'sidebar.menu': { en: 'Menu', ar: 'القائمة' },
  'sidebar.home': { en: 'Home', ar: 'الرئيسية' },
  'sidebar.profile': { en: 'Profile', ar: 'الملف الشخصي' },
  'sidebar.courses': { en: 'Courses', ar: 'الدورات' },
  'sidebar.wishlist': { en: 'Wishlist', ar: 'قائمة الرغبات' },
  'sidebar.jobs': { en: 'Jobs', ar: 'الوظائف' },
  'sidebar.volunteering': { en: 'Volunteering', ar: 'التطوع' },
  'sidebar.studentProfile': { en: 'Student Profile', ar: 'الملف الشخصي للطالب' },
  'sidebar.contact': { en: 'Contact Us', ar: 'تواصل معنا' },
  'sidebar.about': { en: 'About', ar: 'من نحن' },
  'sidebar.preferences': { en: 'Preferences', ar: 'التفضيلات' },
  'sidebar.theme': { en: 'Theme', ar: 'المظهر' },
  'sidebar.lightMode': { en: 'Light', ar: 'فاتح' },
  'sidebar.darkMode': { en: 'Dark', ar: 'داكن' },
  'sidebar.language': { en: 'Language', ar: 'اللغة' },
  'sidebar.english': { en: 'English', ar: 'الإنجليزية' },
  'sidebar.arabic': { en: 'العربية', ar: 'العربية' },
  'sidebar.signOut': { en: 'Sign Out', ar: 'تسجيل الخروج' },
  'sidebar.signIn': { en: 'Sign In', ar: 'تسجيل الدخول' },

  // ---------------- navbar / notifications ----------------
  'nav.notifications': { en: 'Notifications', ar: 'الإشعارات' },
  'nav.markAllRead': { en: 'Mark all as read', ar: 'وضع علامة مقروء على الكل' },
  'nav.noNotifications': { en: 'No new notifications', ar: 'لا توجد إشعارات جديدة' },
  'nav.services': { en: 'Services', ar: 'خدماتنا' },
  'nav.workshops': { en: 'Workshops', ar: 'ورش العمل' },
  'nav.jobOpportunities': { en: 'Job Opportunities', ar: 'فرص العمل' },
  'nav.login': { en: 'Login', ar: 'تسجيل الدخول' },
  'nav.register': { en: 'Register', ar: 'إنشاء حساب' },
  'nav.admin': { en: 'Admin', ar: 'الإدارة' },

  // ---------------- courses ----------------
  'courses.title': { en: 'Explore Our Courses', ar: 'استكشف دوراتنا' },
  'courses.enroll': { en: 'Enroll', ar: 'تسجيل' },
  'courses.enrollNow': { en: 'Enroll Now', ar: 'سجل الآن' },
  'courses.searchPlaceholder': { en: 'Search for a course...', ar: 'ابحث عن دورة...' },
  'courses.addToWishlist': { en: 'Add to Wishlist', ar: 'أضف لقائمة الرغبات' },
  'courses.removeFromWishlist': { en: 'Remove from Wishlist', ar: 'إزالة من قائمة الرغبات' },
  'courses.free': { en: 'Free', ar: 'مجاناً' },

  // ---------------- student profile ----------------
  'profile.title': { en: 'Student Profile', ar: 'الملف الشخصي للطالب' },
  'profile.personalInfo': { en: 'Personal Info', ar: 'المعلومات الشخصية' },
  'profile.myCourses': { en: 'My Courses', ar: 'دوراتي' },
  'profile.jobApplications': { en: 'Job Applications', ar: 'طلبات التوظيف' },
  'profile.volunteerWork': { en: 'Volunteer Work', ar: 'العمل التطوعي' },
  'profile.savedItems': { en: 'Saved Items', ar: 'العناصر المحفوظة' },
  'profile.basicInfo': { en: 'Basic Information', ar: 'المعلومات الأساسية' },
  'profile.professionalDetails': { en: 'Professional Details', ar: 'التفاصيل المهنية' },
  'profile.email': { en: 'Email Address', ar: 'البريد الإلكتروني' },
  'profile.gender': { en: 'Gender', ar: 'الجنس' },
  'profile.firstName': { en: 'First Name', ar: 'الاسم الأول' },
  'profile.lastName': { en: 'Last Name', ar: 'اسم العائلة' },
  'profile.phone': { en: 'Phone Number', ar: 'رقم الهاتف' },
  'profile.nationalId': { en: 'National ID', ar: 'الرقم القومي' },
  'profile.faculty': { en: 'Faculty / University', ar: 'الكلية / الجامعة' },
  'profile.graduationYear': { en: 'Graduation Year', ar: 'سنة التخرج' },
  'profile.enrolledCourses': { en: 'Enrolled Courses', ar: 'الدورات المسجلة' },
  'profile.completeProfile': { en: 'Complete My Profile', ar: 'استكمال ملفي الشخصي' },

  // ---------------- contact us ----------------
  'contact.title': { en: 'Contact Us', ar: 'تواصل معنا' },
  'contact.name': { en: 'Full Name', ar: 'الاسم الكامل' },
  'contact.email': { en: 'Email Address', ar: 'البريد الإلكتروني' },
  'contact.issueType': { en: 'Subject', ar: 'الموضوع' },
  'contact.message': { en: 'Message', ar: 'الرسالة' },
  'contact.send': { en: 'Send Message', ar: 'إرسال الرسالة' },
  'contact.success': { en: 'Your message has been sent. We will get back to you soon.', ar: 'تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.' },

  // ---------------- wishlist ----------------
  'wishlist.title': { en: 'My Wishlist', ar: 'قائمة رغباتي' },
  'wishlist.empty': { en: 'Your wishlist is empty.', ar: 'قائمة رغباتك فارغة.' },
  'wishlist.browseCourses': { en: 'Browse Courses', ar: 'استعرض الدورات' },

  // ---------------- volunteering ----------------
  'volunteering.title': { en: 'Volunteer With Us', ar: 'تطوع معنا' },
  'volunteering.subtitle': { en: 'Give back to the community, gain real-world experience, and build your network.', ar: 'ساهم في مجتمعك، واكتسب خبرة حقيقية، ووسّع شبكة علاقاتك.' },
  'volunteering.searchPlaceholder': { en: 'Search by role or committee...', ar: 'ابحث بالدور أو اللجنة...' },
  'volunteering.readMoreApply': { en: 'Read More & Apply', ar: 'اقرأ المزيد وتقدّم' },
  'volunteering.spotsLeft': { en: 'spot(s) left', ar: 'مقعد متاح' },
  'volunteering.deadline': { en: 'Deadline', ar: 'الموعد النهائي' },
  'volunteering.submitApplication': { en: 'Submit Application', ar: 'إرسال الطلب' },
  'volunteering.motivationLabel': { en: 'Why do you want to volunteer for this role?', ar: 'لماذا تريد التطوع في هذا الدور؟' },
  'volunteering.skillsLabel': { en: 'Relevant skills (optional)', ar: 'المهارات ذات الصلة (اختياري)' },
  'volunteering.empty': { en: 'No opportunities found', ar: 'لا توجد فرص متاحة' },

  // ---------------- jobs ----------------
  'jobs.title': { en: 'Find Your Next Opportunity', ar: 'اعثر على فرصتك القادمة' },
  'jobs.apply': { en: 'Apply Now', ar: 'تقدّم الآن' },

  // ---------------- admin layout chrome ----------------
  'admin.dashboard': { en: 'Dashboard', ar: 'لوحة التحكم' },
  'admin.students': { en: 'Students', ar: 'الطلاب' },
  'admin.courses': { en: 'Courses', ar: 'الدورات' },
  'admin.jobs': { en: 'Jobs', ar: 'الوظائف' },
  'admin.volunteering': { en: 'Volunteering', ar: 'التطوع' },
  'admin.messages': { en: 'Messages', ar: 'الرسائل' },
  'admin.logout': { en: 'Logout', ar: 'تسجيل الخروج' },
  'admin.notifications': { en: 'Admin Notifications', ar: 'إشعارات الإدارة' },
  'admin.visitSite': { en: 'Visit site', ar: 'زيارة الموقع' },
};
