const translations = {
  th: {
    appTitle: 'จองเครื่องมือห้องเรียน',
    appSubtitle: 'เปิดให้จองเฉพาะช่วงบ่ายวันศุกร์ (12:00 - 15:00) สล็อตละ 1 ชม.',
    pageTitle: 'จองเครื่องมือห้องเรียน | STEM Lab',

    // nav
    navManageEquipment: 'จัดการเครื่องมือ',
    navAllBookings: 'แดชบอร์ดการจอง',
    navAllUsers: 'รายการผู้จอง',
    navHome: 'หน้าหลัก',
    navLogout: 'ออกจากระบบ',

    // login
    loginSubtitle: 'เข้าสู่ระบบด้วยอีเมล Gmail ของคุณ (รหัสนักศึกษา) เพื่อจองรอบใช้งานเครื่องมือ',
    loginPrompt: 'กรุณาเข้าสู่ระบบด้วยบัญชี Google เพื่อจองเวลาใช้เครื่องมือ',
    loginErrDomain: 'อีเมลนี้ไม่ได้รับอนุญาตให้เข้าใช้งานระบบ',
    loginErrGeneric: 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่',

    // booking form
    sectionBook: 'จองรอบใช้งานเครื่องมือ',
    labelEquipment: 'เครื่องมือ',
    labelDate: 'วันศุกร์ที่',
    selectEquipment: '-- เลือกเครื่องมือ --',
    selectDate: '-- เลือกวันศุกร์ --',
    btnBook: 'จองเวลา',
    slotAvail: 'ว่าง',
    slotFull: 'เต็มแล้ว',
    capacityLabel: 'รองรับ',
    seatLabel: 'ที่นั่ง',

    // my bookings
    sectionMyBookings: 'การจองของฉัน',
    emptyBookings: 'ยังไม่มีรายการจอง',
    ticketLabelEquipment: 'เครื่องมือ',
    ticketLabelDate: 'วันที่',
    ticketLabelTime: 'เวลา',
    ticketLabelBooker: 'ผู้จอง',
    ticketConfirmed: 'ยืนยันแล้ว',
    ticketCancel: 'ยกเลิก',

    // booking rules
    adminRulesTitle: 'กฎการจอง',
    adminRulesSubtitle: 'กำหนดโควต้าการจองของนักศึกษาแต่ละคน',
    adminRulesMaxPerEq: 'จองเครื่องมือเดิมได้ไม่เกิน (ครั้ง)',
    adminRulesMaxTotal: 'จองรวมทั้งหมดได้ไม่เกิน (0 = ไม่จำกัด)',
    adminRulesSave: 'บันทึก',

    // slots management
    adminSlotTitle: 'รอบการจอง',
    adminSlotSubtitle: 'กำหนดช่วงเวลาที่เปิดให้จองในแต่ละวันศุกร์',
    adminSlotAdd: 'เพิ่มรอบใหม่',
    adminSlotStart: 'เริ่ม',
    adminSlotEnd: 'สิ้นสุด',
    adminSlotBtnAdd: 'เพิ่มรอบ',
    adminSlotDelete: 'ลบ',
    adminSlotEmpty: 'ยังไม่มีรอบการจอง',
    adminSlotConfirmDelete: 'ลบรอบนี้?',

    // booking open toggle
    bookingOpenBtn: 'เปิดรับการจอง',
    bookingCloseBtn: 'ปิดรับการจอง',
    bookingOpenStatus: '🟢 เปิดรับการจองอยู่',
    bookingClosedStatus: '🔴 ปิดรับการจองอยู่',
    bookingClosedNotice: 'ขณะนี้ปิดรับการจอง กรุณารอให้แอดมินเปิดรับก่อน',

    // admin equipment
    adminEquipTitle: 'จัดการเครื่องมือ',
    adminEquipSubtitle: 'เพิ่ม แก้ไข จำนวนที่นั่ง/เครื่อง หรือปิดการใช้งาน',
    adminEquipAdd: 'เพิ่มเครื่องมือใหม่',
    adminEquipNameLabel: 'ชื่อเครื่องมือ / ห้อง',
    adminEquipNamePlaceholder: 'เช่น ห้อง 3D Printing',
    adminEquipDescLabel: 'รายละเอียด',
    adminEquipCapLabel: 'จำนวนที่นั่ง/เครื่อง',
    adminEquipBtnAdd: 'เพิ่มเครื่องมือ',
    adminEquipList: 'รายการเครื่องมือทั้งหมด',
    adminEquipEmpty: 'ยังไม่มีเครื่องมือในระบบ',
    adminEquipCapacity: 'รองรับ',
    adminEquipCapacitySave: 'บันทึก',
    adminEquipActive: 'เปิดใช้งาน',
    adminEquipInactive: 'ปิดใช้งาน',
    adminEquipDelete: 'ลบ',
    adminEquipConfirmDelete: 'ลบเครื่องมือนี้?',

    // admin bookings dashboard
    adminBookTitle: 'แดชบอร์ดการจอง',
    adminBookSubtitle: 'ภาพรวมการจองแบ่งตามสัปดาห์',
    adminBookEmpty: 'ยังไม่มีรายการจอง',
    adminBookCancel: 'ยกเลิก',
    adminBookWeek: 'วันศุกร์ที่',
    adminBookFull: 'เต็มแล้ว',
    adminBookFree: 'ว่างอยู่',
    adminBookBooked: 'จองแล้ว',
    adminBookSeats: 'ที่นั่ง',
    adminBookShowWho: 'ดูรายชื่อผู้จอง',
    adminBookNoBooking: 'ยังไม่มีผู้จอง',
    adminBookSlot: 'ช่วง',

    // past bookings
    sectionPastBookings: 'ประวัติการจอง',
    emptyPastBookings: 'ยังไม่มีประวัติการจอง',
    ticketUsed: 'ใช้แล้ว',
    ticketCancelled: 'ยกเลิกแล้ว',

    // error
    backHome: '← กลับหน้าหลัก',

    // lang toggle
    langSwitch: 'English',
  },

  en: {
    appTitle: 'Lab Equipment Booking',
    appSubtitle: 'Booking available Friday afternoons only (12:00–15:00), 1 hr slots.',
    pageTitle: 'Lab Equipment Booking | STEM Lab',

    // nav
    navManageEquipment: 'Manage Equipment',
    navAllBookings: 'Booking Dashboard',
    navAllUsers: 'Bookers',
    navHome: 'Home',
    navLogout: 'Log out',

    // login
    loginSubtitle: 'Sign in with your Gmail / university account to reserve a lab session.',
    loginPrompt: 'Please sign in with your Google account to book equipment.',
    loginErrDomain: 'This email address is not allowed to access the system.',
    loginErrGeneric: 'Sign-in failed. Please try again.',

    // booking form
    sectionBook: 'Reserve a Lab Session',
    labelEquipment: 'Equipment',
    labelDate: 'Friday',
    selectEquipment: '-- Select equipment --',
    selectDate: '-- Select a Friday --',
    btnBook: 'Book',
    slotAvail: 'Available',
    slotFull: 'Full',
    capacityLabel: 'Capacity',
    seatLabel: 'seats',

    // my bookings
    sectionMyBookings: 'My Bookings',
    emptyBookings: 'No bookings yet.',
    ticketLabelEquipment: 'Equipment',
    ticketLabelDate: 'Date',
    ticketLabelTime: 'Time',
    ticketLabelBooker: 'Booked by',
    ticketConfirmed: 'Confirmed',
    ticketCancel: 'Cancel',

    // booking rules
    adminRulesTitle: 'Booking Rules',
    adminRulesSubtitle: 'Set per-student booking quotas.',
    adminRulesMaxPerEq: 'Max bookings per equipment (times)',
    adminRulesMaxTotal: 'Max total active bookings (0 = unlimited)',
    adminRulesSave: 'Save',

    // slots management
    adminSlotTitle: 'Booking Slots',
    adminSlotSubtitle: 'Define time slots available each Friday.',
    adminSlotAdd: 'Add New Slot',
    adminSlotStart: 'Start',
    adminSlotEnd: 'End',
    adminSlotBtnAdd: 'Add Slot',
    adminSlotDelete: 'Delete',
    adminSlotEmpty: 'No slots defined.',
    adminSlotConfirmDelete: 'Delete this slot?',

    // booking open toggle
    bookingOpenBtn: 'Open Booking',
    bookingCloseBtn: 'Close Booking',
    bookingOpenStatus: '🟢 Booking is OPEN',
    bookingClosedStatus: '🔴 Booking is CLOSED',
    bookingClosedNotice: 'Booking is currently closed. Please wait for admin to open it.',

    // admin equipment
    adminEquipTitle: 'Manage Equipment',
    adminEquipSubtitle: 'Add, edit capacity, or disable equipment/rooms.',
    adminEquipAdd: 'Add New Equipment',
    adminEquipNameLabel: 'Equipment / Room Name',
    adminEquipNamePlaceholder: 'e.g. 3D Printing Room',
    adminEquipDescLabel: 'Description',
    adminEquipCapLabel: 'Capacity (seats/machines)',
    adminEquipBtnAdd: 'Add Equipment',
    adminEquipList: 'All Equipment',
    adminEquipEmpty: 'No equipment in the system yet.',
    adminEquipCapacity: 'Capacity',
    adminEquipCapacitySave: 'Save',
    adminEquipActive: 'Active',
    adminEquipInactive: 'Inactive',
    adminEquipDelete: 'Delete',
    adminEquipConfirmDelete: 'Delete this equipment?',

    // admin bookings dashboard
    adminBookTitle: 'Booking Dashboard',
    adminBookSubtitle: 'Weekly overview of all reservations.',
    adminBookEmpty: 'No bookings yet.',
    adminBookCancel: 'Cancel',
    adminBookWeek: 'Friday',
    adminBookFull: 'Full',
    adminBookFree: 'Available',
    adminBookBooked: 'Booked',
    adminBookSeats: 'seats',
    adminBookShowWho: 'Show bookings',
    adminBookNoBooking: 'No bookings yet',
    adminBookSlot: 'Slot',

    // past bookings
    sectionPastBookings: 'Booking History',
    emptyPastBookings: 'No past bookings.',
    ticketUsed: 'Used',
    ticketCancelled: 'Cancelled',

    // error
    backHome: '← Back to home',

    // lang toggle
    langSwitch: 'ภาษาไทย',
  },
};

function getLang(req) {
  return req.session && req.session.lang === 'en' ? 'en' : 'th';
}

function i18nMiddleware(req, res, next) {
  const lang = getLang(req);
  res.locals.lang = lang;
  res.locals.t = translations[lang];
  next();
}

module.exports = { translations, getLang, i18nMiddleware };
