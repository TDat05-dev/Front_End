import styles from '../../scss/RegisterPage.module.scss'

const APP_NAME = 'Loza'
const LOGO_SRC = '/loza-logo.png'

export default function RegisterPage() {
  return (
    <main className={styles.page}>
      <header className={styles.brand}>
        <h1 className={styles.logo}>
          <img className={styles.logoImage} src={LOGO_SRC} alt={APP_NAME} />
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
            <input className={styles.input} name="fullName" type="text" placeholder="Họ và tên" aria-label="Họ và tên" autoComplete="name" />
          </div>

          <div className={styles.control}>
            <span className={styles.icon}><i className="fa-solid fa-mobile-screen-button" aria-hidden="true" /></span>
            <span className={styles.prefix}>+84</span>
            <input className={styles.input} name="phone" type="tel" inputMode="numeric" placeholder="Số điện thoại" aria-label="Số điện thoại" autoComplete="tel-national" />
          </div>

          <div className={styles.control}>
            <span className={styles.icon}><i className="fa-solid fa-lock" aria-hidden="true" /></span>
            <input className={styles.input} name="password" type="password" placeholder="Mật khẩu" aria-label="Mật khẩu" autoComplete="new-password" />
            <span className={styles.icon}><i className="fa-regular fa-eye" aria-hidden="true" /></span>
          </div>

          <div className={styles.control}>
            <span className={styles.icon}><i className="fa-solid fa-lock" aria-hidden="true" /></span>
            <input className={styles.input} name="confirmPassword" type="password" placeholder="Nhập lại mật khẩu" aria-label="Nhập lại mật khẩu" autoComplete="new-password" />
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
          <a className={styles.link} href="/login">
            Đăng nhập ngay
          </a>
        </footer>
      </section>
    </main>
  )
}
