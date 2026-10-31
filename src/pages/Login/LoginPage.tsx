import { useState } from 'react'
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
              <span className={styles.icon}><i className="fa-solid fa-mobile-screen-button" aria-hidden="true" /></span>
              <span className={styles.prefix}>+84</span>
              <input className={styles.input} name="phone" type="tel" inputMode="numeric" placeholder="Số điện thoại" aria-label="Số điện thoại" autoComplete="tel-national" />
            </div>

            <div className={styles.control}>
              <span className={styles.icon}><i className="fa-solid fa-lock" aria-hidden="true" /></span>
              <input className={styles.input} name="password" type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" aria-label="Mật khẩu" autoComplete="current-password" />
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

            <a className={styles.forgot} href="/forgot-password">
              Quên mật khẩu?
            </a>
          </form>

          <footer className={styles.footer}>
            Bạn chưa có tài khoản?{' '}
            <a className={styles.link} href="/register">
              Đăng ký ngay
            </a>
          </footer>
        </section>
      </main>
  )
}
