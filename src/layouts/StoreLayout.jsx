import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
export default function StoreLayout() {
  return (
    <>
      <Navbar />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
