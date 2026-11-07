import { Link } from 'react-router-dom'
import { useState } from 'react'
import styles from '../assets/css/navbar.module.css'
import ProfilePopup from './ProfilePopup'

export default function NavBar(){
    const [showProfile, setShowProfile] = useState(false)
    return(
        <>
        <div className={styles.menu}>
            <div className={styles.listPage}>
                <Link to="/chats" className={styles.listItem} aria-label="Chat"><i className="fa-solid fa-message"></i></Link>
                <Link to="/friends" className={styles.listItem} aria-label="Danh sách bạn bè"><i className="fa-solid fa-user-group"></i></Link>
                <Link to="/settings" className={styles.listItem} aria-label="Cài đặt"><i className="fa-solid fa-gear"></i></Link>
            </div>
            <button type="button" className={styles.profile} onClick={() => setShowProfile(true)}>
                <i className="fa-solid fa-user"/>
            </button>
        </div>

            {showProfile && (
            <ProfilePopup
                onClose={() => setShowProfile(false)}
            />
            )}
        </>
    )
}