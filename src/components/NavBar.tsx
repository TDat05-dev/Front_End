import styles from '../assets/css/navbar.module.css'

export default function NavBar(){
    return(
        <div className={styles.menu}>
            <div className={styles.listPage}>
                <a href="/" className={styles.listItem}><i className="fa-solid fa-message"></i></a>
                <a href="/" className={styles.listItem}><i className="fa-solid fa-user-group"></i></a>
                <a href="/" className={styles.listItem}><i className="fa-solid fa-gear"></i></a>
            </div>
            <button className={styles.profile}><i className="fa-solid fa-user"></i></button>
        </div>
    )
}