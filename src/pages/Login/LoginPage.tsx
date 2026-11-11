import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { auth } from '../../auth/auth'
import { request } from '../../services/socket'
import styles from '../../assets/css/LoginPage.module.scss'
import logo from '../../assets/img/loza-logo.png'

const APP_NAME = 'Loza'

export default function LoginPage() {
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
    setLoading(true)
    setError(null)

    request('LOGIN', { user: user.trim(), pass: password })
      .then((res) => {
        if (res.status !== 'success') {
          throw new Error('Sai tên người dùng hoặc mật khẩu')
        }
        navigate('/chats', { replace: true })
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
            Đăng nhập tài khoản {APP_NAME} để kết nối với bạn bè
          </p>
        </header>

        <section className={styles.card} aria-label="Đăng nhập">
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.control}>
              <span className={styles.icon}><i className="fa-regular fa-user" aria-hidden="true" /></span>
              <input className={styles.input} name="user" type="text" placeholder="Tên người dùng" aria-label="Tên người dùng" autoComplete="username" value={user} onChange={(e) => setUser(e.target.value)} pattern="[A-Za-z0-9_]+" title="Chỉ gồm chữ cái, số và dấu gạch dưới" required />
            </div>

            <div className={styles.control}>
              <span className={styles.icon}><i className="fa-solid fa-lock" aria-hidden="true" /></span>
              <input className={styles.input} name="password" type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" aria-label="Mật khẩu" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button
                  type="button"
                  className={styles.toggle}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  onClick={() => setShowPassword((v) => !v)}
              >
                <i className={showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'} aria-hidden="true" />
              </button>
            </div>

            {error && <p className={styles.error} role="alert">{error}</p>}

            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <footer className={styles.footer}>
            Bạn chưa có tài khoản?{' '}
            <Link className={styles.link} to="/register">
              Đăng ký ngay
            </Link>
          </footer>
        </section>
      </main>
  )
}
