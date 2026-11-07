export type ContactType = 0 | 1

export interface Contact {
    name: string
    type: ContactType
    actionTime: string
}

export const CONTACTS: Contact[] = [
    { name: 'an_nguyen', type: 0, actionTime: '2026-11-07 09:15:00' },
    { name: 'anhthu', type: 0, actionTime: '2026-11-06 21:40:00' },
    { name: 'baongoc', type: 0, actionTime: '2026-11-05 08:00:00' },
    { name: 'binh_tran', type: 0, actionTime: '2026-11-04 17:20:00' },
    { name: 'chi_le', type: 0, actionTime: '2026-11-03 10:05:00' },
    { name: 'dat', type: 0, actionTime: '2026-11-07 10:30:00' },
    { name: 'giang_vo', type: 0, actionTime: '2026-11-02 14:00:00' },
    { name: 'hamy', type: 0, actionTime: '2026-11-01 19:45:00' },
    { name: 'hoang_long', type: 0, actionTime: '2026-10-31 11:10:00' },
    { name: 'khoa_ly', type: 0, actionTime: '2026-10-30 16:25:00' },
    { name: 'minhquan', type: 0, actionTime: '2026-10-29 08:50:00' },
    { name: 'phuongvy', type: 0, actionTime: '2026-10-28 22:15:00' },
    { name: 'tung', type: 0, actionTime: '2026-11-07 10:45:00' },
    { name: 'yennhi', type: 0, actionTime: '2026-10-27 13:30:00' },
    { name: 'Nhom_DoAn_FE', type: 1, actionTime: '2026-11-07 11:00:00' },
    { name: 'LTW-room', type: 1, actionTime: '2026-11-06 20:00:00' },
    { name: 'CLB_Guitar', type: 1, actionTime: '2026-11-03 18:30:00' },
    { name: 'K23-CNTT', type: 1, actionTime: '2026-11-01 09:00:00' },
]
