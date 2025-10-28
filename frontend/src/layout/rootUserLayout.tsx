import Header from "../components/ui/Header/Header"
import Sidebar from "../components/ui/Sidebar/Sidebar"
import Footer from "../components/ui/Footer/Footer"
import { Outlet } from 'react-router-dom'

const RootUserLayout = () => {

  return (
    <>
        <Header/>
        <Sidebar/>
        <Outlet/>
        <Footer/>
    </>
    
  )
}

export default RootUserLayout