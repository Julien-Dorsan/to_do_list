import { Outlet } from 'react-router-dom'
import Sidebar from "../../components/ui/Sidebar/Sidebar"

const RootUserLayout = () => {

  return (
    <>
        <Sidebar/>
        <Outlet/>
    </>
    
  )
}

export default RootUserLayout