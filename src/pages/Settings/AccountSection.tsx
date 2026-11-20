import { useState, type FormEvent } from 'react'
import { auth } from '../../auth/auth'
import styles from '../../assets/css/SettingsPage.module.scss'
import {
  BIO_MAX_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
  getProfile,
  saveProfile,
  type Gender,
  type Profile,
} from '../../utils/profile'

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: '', label: 'Chưa chọn' },
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
]

const MIN_BIRTHDAY = '1900-01-01'

function todayISO() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 10)
}

type Status = { type: 'success' | 'error'; message: string } | null

export default function AccountSection() {
  const username = auth.user ?? ''
  const [form, setForm] = useState<Profile>(() => getProfile(username))
  const [status, setStatus] = useState<Status>(null)
  const today = todayISO()

  const update = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setStatus(null)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const displayName = form.displayName.trim().replace(/\s+/g, ' ')
    if (!displayName) {
      setStatus({ type: 'error', message: 'Vui lòng nhập tên hiển thị' })
      return
    }
    if (form.birthday && (form.birthday < MIN_BIRTHDAY || form.birthday > today)) {
      setStatus({ type: 'error', message: 'Ngày sinh không hợp lệ' })
      return
    }

    const profile: Profile = { ...form, displayName, bio: form.bio.trim() }
    if (!saveProfile(username, profile)) {
      setStatus({ type: 'error', message: 'Trình duyệt không cho phép lưu dữ liệu, vui lòng thử lại' })
      return
    }

    setForm(profile)
    setStatus({ type: 'success', message: 'Đã lưu thay đổi' })
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.cardTitle}>Thông tin tài khoản</h2>

      <div className={styles.avatarRow}>
        <span className={styles.avatar}>NA</span>
        <div>
          <button type="button" className={styles.secondaryButton}>
            <i className="fa-solid fa-camera" aria-hidden="true" /> Đổi ảnh đại diện
          </button>
          <p className={styles.hint}>JPG, PNG hoặc WEBP, tối đa 2MB</p>
        </div>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Tên hiển thị</span>
        <input
          className={styles.input}
          name="displayName"
          value={form.displayName}
          maxLength={DISPLAY_NAME_MAX_LENGTH}
          onChange={(e) => update('displayName', e.target.value)}
        />
      </label>

      <div className={styles.fieldRow}>
        <label className={styles.field}>
          <span className={styles.label}>Ngày sinh</span>
          <input
            className={styles.input}
            type="date"
            name="birthday"
            value={form.birthday}
            min={MIN_BIRTHDAY}
            max={today}
            onChange={(e) => update('birthday', e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Giới tính</span>
          <select
            className={styles.input}
            name="gender"
            value={form.gender}
            onChange={(e) => update('gender', e.target.value as Gender)}
          >
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Giới thiệu bản thân</span>
        <textarea
          className={`${styles.input} ${styles.textarea}`}
          name="bio"
          value={form.bio}
          maxLength={BIO_MAX_LENGTH}
          placeholder="Viết vài dòng về bạn..."
          onChange={(e) => update('bio', e.target.value)}
        />
        <span className={styles.counter}>{form.bio.length}/{BIO_MAX_LENGTH}</span>
      </label>

      <p className={styles.note}>
        <i className="fa-solid fa-circle-info" aria-hidden="true" /> Thông tin này chỉ được lưu trên trình duyệt của thiết bị này.
      </p>

      {status && (
        <p className={status.type === 'success' ? styles.success : styles.error} role={status.type === 'error' ? 'alert' : 'status'}>
          {status.message}
        </p>
      )}

      <div className={styles.actions}>
        <button type="submit" className={styles.primaryButton}>Lưu thay đổi</button>
      </div>
    </form>
  )
}
