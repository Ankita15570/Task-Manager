import { useState } from 'react'
import { HiOutlineX, HiOutlineMenu } from 'react-icons/hi';
import { FiCheck } from 'react-icons/fi';
import SideMenu from './SideMenu'

const Navbar = ({activeMenu}) => {
    const [openSideMenu, setOpenSideMenu] = useState(false)
  return (
        <header className='dashboard-topbar'>
            <div className='dashboard-topbar-inner'>
        <button
        type='button'
                className='dashboard-menu-toggle'
                aria-label={openSideMenu ? 'Close navigation' : 'Open navigation'}
                aria-expanded={openSideMenu}
        onClick={()=> {
            setOpenSideMenu(!openSideMenu)
        }}
        >
            {openSideMenu ? (
                                <HiOutlineX />
            ) : (
                                <HiOutlineMenu />
            )}
        </button>
                <div className='dashboard-wordmark'>
                    <span className='dashboard-brand-mark' aria-hidden='true'><FiCheck /></span>
                    <span>Task Manager</span>
                </div>
                <span className='dashboard-topbar-section'>{activeMenu}</span>
            </div>

        {openSideMenu && (
                        <div className='dashboard-mobile-nav'>
                                <button
                                    type='button'
                                    className='dashboard-mobile-backdrop'
                                    aria-label='Close navigation'
                                    onClick={() => setOpenSideMenu(false)}
                                />
                                <div className='dashboard-mobile-panel'>
                                    <SideMenu activeMenu={activeMenu} onNavigate={() => setOpenSideMenu(false)}/>
                                </div>
            </div>
        )}
        </header>
  )
}

export default Navbar
