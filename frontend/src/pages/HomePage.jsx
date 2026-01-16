import React, { useState } from 'react'
import SideBar from '../components/SideBar'
import Chatcontainer from '../components/Chatcontainer'
import RightSidebar from '../components/RightSidebar'
import { useContext } from 'react'
import { ChatContext } from '../../context/ChatContext'
import assets from '../assets/assets'

const HomePage = () => {
  const {selectedUser} = useContext(ChatContext)
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  return (
    <div className='border w-full h-screen sm:px-[10%] sm:py-[5%]'>
      <div
        className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-full grid relative
          ${
            selectedUser
              ? showRightSidebar
                ? "grid-cols-1 md:grid-cols-[1fr_2fr_1fr]"
                : "grid-cols-1 md:grid-cols-[1fr_3fr]"
              : "grid-cols-1 md:grid-cols-2"
          }
        `}
      >
        <SideBar />
        {selectedUser ? (
          <Chatcontainer onOpenInfo={() => setShowRightSidebar(true)} />
          ) : (
          <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
            <img src={assets.logo_icon} alt='' className='max-w-16'/>
            <p className='text-lg font-medium text-white'>Chat anywhere ,anytime</p>
          </div>
          )
        }

        {selectedUser && showRightSidebar && (
          <RightSidebar onClose={() => setShowRightSidebar(false)} />
        )}
      </div>
    </div>
  )
}

export default HomePage
