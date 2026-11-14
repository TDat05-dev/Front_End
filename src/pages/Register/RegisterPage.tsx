import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { auth } from '../../auth/auth'
import { request } from '../../services/socket'
import styles from '../../assets/css/RegisterPage.module.scss'
import logo from '../../assets/img/loza-logo.png'

const APP_NAME = 'Loza'

const USERNAME_PATTERN = /^[A-Za-z0-9_]+$/

export default function RegisterPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (auth.isAuthenticated) {
    return <Navigate to="/chats" replace />
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (loading) return

    const username = user.trim()
    if (!username || !password) {
      setError('Vui lòng nhập tên người dùng và mật khẩu')
      return
    }
    if (!USERNAME_PATTERN.test(username)) {
      setError('Tên người dùng chỉ gồm chữ cái, số và dấu gạch dưới')
      return
    }

    setLoading(true)
    setError(null)

    request('REGISTER', { user: username, pass: password })
      .then((res) => {
        if (res.status !== 'success') {
          throw new Error(res.mes || 'Đăng ký thất bại')
        }
        navigate('/login', { replace: true })
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoading(false)
      })
  }

  return (
    <main className={styles.page}>
      <header className={styles.brand}>
        <h1 className={styles.logo}>
          <img className={styles.logoImage} src={logo} alt={APP_NAME} />
        </h1>
        <p className={styles.tagline}>
           Chia sẻ niềm vui, gõ nhịp kết nối
        </p>
      </header>

      <section className={styles.card} aria-labelledby="register-title">
        <h2 id="register-title" className={styles.cardHeader}>
          Đăng ký tài khoản
        </h2>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.control}>
            <span className={styles.icon}><i className="fa-regular fa-user" aria-hidden="true" /></span>
              <input className={styles.input} name="user" type="text" placeholder="Tên người dùng" aria-label="Tên người dùng" autoComplete="username" value={user} onChange={(e) => { setUser(e.target.value); setError(null) }} disabled={loading} />
          </div>

          <div className={styles.control}>
            <span className={styles.icon}><i className="fa-solid fa-lock" aria-hidden="true" /></span>
            <input className={styles.input} name="password" type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" aria-label="Mật khẩu" autoComplete="new-password" value={password} onChange={(e) => { setPassword(e.target.value); setError(null) }} disabled={loading} />
            <button
                type="button"
                className={styles.toggle}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                onClick={() => setShowPassword((v) => !v)}
            >
              <i className={showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'} aria-hidden="true" />
            </button>
          </div>

          <div className={styles.control}>
            <span className={styles.icon}><i className="fa-solid fa-lock" aria-hidden="true" /></span>
            <input className={styles.input} name="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Nhập lại mật khẩu" aria-label="Nhập lại mật khẩu" autoComplete="new-password" disabled={loading} />
          </div>

          <label className={styles.terms}>
            <input type="checkbox" name="acceptTerms" disabled={loading} />
            <span>
              Tôi đồng ý với{' '}
              <a className={styles.link} href="/terms" target="_blank" rel="noopener noreferrer">
                điều khoản sử dụng
              </a>{' '}
              của {APP_NAME}
            </span>
          </label>

          {error && <p className={styles.error} role="alert">{error}</p>}
          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <footer className={styles.footer}>
          Bạn đã có tài khoản?{' '}
          <Link className={styles.link} to="/login">
            Đăng nhập ngay
          </Link>
        </footer>
      </section>
    </main>
  )
}
