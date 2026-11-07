import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from '../../assets/css/RegisterPage.module.scss'
import logo from '../../assets/img/loza-logo.png'

const APP_NAME = 'Loza'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)

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

        <form className={styles.form}>
          <div className={styles.control}>
            <span className={styles.icon}><i className="fa-regular fa-user" aria-hidden="true" /></span>
              <input className={styles.input} name="user" type="text" placeholder="Tên người dùng" aria-label="Tên người dùng" autoComplete="username" pattern="[A-Za-z0-9_]+" title="Chỉ gồm chữ cái, số và dấu gạch dưới" required />
          </div>

          <div className={styles.control}>
            <span className={styles.icon}><i className="fa-solid fa-lock" aria-hidden="true" /></span>
            <input className={styles.input} name="password" type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" aria-label="Mật khẩu" autoComplete="new-password" required />
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
            <input className={styles.input} name="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Nhập lại mật khẩu" aria-label="Nhập lại mật khẩu" autoComplete="new-password" required />
          </div>

          <label className={styles.terms}>
            <input type="checkbox" name="acceptTerms" />
            <span>
              Tôi đồng ý với{' '}
              <a className={styles.link} href="/terms" target="_blank" rel="noopener noreferrer">
                điều khoản sử dụng
              </a>{' '}
              của {APP_NAME}
            </span>
          </label>

          <button type="button" className={styles.submit}>
            Đăng ký
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
