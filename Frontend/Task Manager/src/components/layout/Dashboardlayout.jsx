import { useContext } from 'react'
import { UserContext } from '../../context/useContext'
import Navbar from './Navbar'
import SideMenu from './SideMenu'

const Dashboardlayout = ({children , activeMenu}) => {
    const {user} = useContext(UserContext)
  return (
    <div className='dashboard-shell'>
      <Navbar activeMenu={activeMenu} />

      {user && (
        <div className='dashboard-frame'>
          <aside className='dashboard-desktop-sidebar'>
            <SideMenu activeMenu={activeMenu}/>
          </aside>
          <main className='dashboard-content'>{children}</main>
        </div>
      )}
    </div>
  )
}

export default Dashboardlayout
