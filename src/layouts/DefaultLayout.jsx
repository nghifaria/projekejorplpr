import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

export default function DefaultLayout({ children }) {
  return (
    <div className="drawer drawer-mobile">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
      <Sidebar />
    </div>
  )
}
