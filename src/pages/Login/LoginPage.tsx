import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from '../../assets/css/LoginPage.module.scss'
import logo from '../../assets/img/loza-logo.png'

const APP_NAME = 'Loza'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

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
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.control}>
              <span className={styles.icon}><i className="fa-regular fa-user" aria-hidden="true" /></span>
              <input className={styles.input} name="user" type="text" placeholder="Tên người dùng" aria-label="Tên người dùng" autoComplete="username" pattern="[A-Za-z0-9_]+" title="Chỉ gồm chữ cái, số và dấu gạch dưới" required />
            </div>

            <div className={styles.control}>
              <span className={styles.icon}><i className="fa-solid fa-lock" aria-hidden="true" /></span>
              <input className={styles.input} name="password" type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" aria-label="Mật khẩu" autoComplete="current-password" required />
              <button
                  type="button"
                  className={styles.toggle}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  onClick={() => setShowPassword((v) => !v)}
              >
                <i className={showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'} aria-hidden="true" />
              </button>
            </div>

            <button type="submit" className={styles.submit}>
              Đăng nhập
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
