import React, { useEffect, useRef } from 'react'
import assets from '../assets/assets'
import { formatDate } from '../lib/utils'
import { useContext } from 'react'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import { useState } from 'react'
import toast from 'react-hot-toast'

const Chatcontainer = ({ onOpenInfo }) => {
  
  const { messages ,setMessages ,sendMessage , getMessages ,selectedUser ,setSelectedUser } = useContext(ChatContext)
  const { authUser ,onlineUsers } = useContext(AuthContext)

  const [input ,setInput] = useState("");

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if(input.trim() === "") return null;
    await sendMessage({ text : input.trim() });
    setInput("");
  }
  // Handle sending a image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if(!file || !file.type.startsWith("image/")){
      toast.error("select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    const previewUrl = URL.createObjectURL(file);

    const tempId = Date.now();

    const tempMessage = {
      _id: tempId,
      senderId: authUser._id,
      image: previewUrl,
      pending: true,
      createdAt: new Date()
    };
    setMessages(prev => [...prev, tempMessage]);

    const reader = new FileReader();

    reader.onloadend = async()=>{
      try {
        await sendMessage({image : reader.result ,tempId});
      } catch (error) {
        setMessages(prev => prev.filter(msg => msg._id !== tempId));
        toast.error("Image upload failed");
      } 
    }
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  useEffect(()=>{
    if(!selectedUser) return;
    getMessages(selectedUser._id);
  },[selectedUser])

  const scrollEnd = useRef()
  useEffect(()=>{
    if(scrollEnd.current && messages){
      scrollEnd.current.scrollIntoView({ behavior : "smooth" })
    }
  },[messages])
  
  return selectedUser && (
    <div className='h-full overflow-scroll relative backdrop-blur-lg'>
      
      {/* {Header} */}
      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
        <img src={selectedUser.profilePic || assets.avatar_icon} alt='' className='w-8 rounded-full' />
        <p className='flex-1 text-lg text-white flex items-center gap-2'>
          {selectedUser?.fullName}
          {onlineUsers?.includes(selectedUser._id) && (
            <span className='w-2 h-2 rounded-full bg-green-500'></span>
          )}
        </p>
        <img onClick={()=>setSelectedUser(null)} src={assets.arrow_icon} alt='' className='cursor-pointer md max-w-7' />
        <img onClick={onOpenInfo} src={assets.help_icon} alt='info' className='cursor-pointer max-md:hidden max-w-5'/>
      </div>
      
      {/* {Chat area} */}
      <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
        {Array.isArray(messages) && messages.map((msg ,index)=>{
          
          const isMe = msg.senderId === authUser._id;

          return(
            <div key={index} className={`flex items-end gap-2 justify-end ${isMe ? 'justify-end' : 'flex-row-reverse'}`}>
              
              { msg.image ? (
                <img src={msg.image}  alt='' className={`max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8 
                  ${msg.pending ? 'blur-sm opacity-60' : ''}`} />
              ) : (
                <div className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all
                  text-white ${isMe 
                                  ? 'bg-violet-500/50  rounded-br-none' 
                                  : 'bg-gray-700/40  rounded-bl-none'}`}>
                  
                  {/* {isMe && (
                    <span className="block text-[10px] text-gray-300 mb-1">
                      You
                    </span>
                  )} */}
                  {msg.text}
                </div>
              )}

              <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} text-xs`}>
                
                <img src={isMe ? authUser?.profilePic || assets.avatar_icon : selectedUser?.profilePic ||assets.avatar_icon} 
                  alt="" className='w-7 rounded-full' />
                
                <p className='text-[11px] text-gray-400 mt-1'>{formatDate(msg.createdAt)}</p>
              </div>
            </div>
          )
        })}
        
        <div ref={scrollEnd}></div>
      </div>
      
      {/* {bottom area} */}
      <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3'>
        <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>
          
          <input onChange={(e)=>setInput(e.target.value)} value={input} onKeyDown={(e)=> e.key === "Enter" ? handleSendMessage(e) : null}
            type='text' placeholder='Send a message' 
            className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400'/>
          
          <input onChange={handleSendImage} type='file' id='image' accept='image/png ,image/jpeg' hidden/>
          <label htmlFor='image'>
            <img src={assets.gallery_icon} alt='' className='w-5 mr-2 cursor-pointer' />
          </label>
        </div>
        <img onClick={input.trim() ? handleSendMessage : undefined} src={assets.send_button} alt='' 
        className={`w-7 transition-all duration-200 ${input.trim() ? "cursor-pointer hover:scale-110 active:scale-95" : "opacity-40 cursor-not-allowed"}`} />
      </div>  

    </div>
  ) 
}

export default Chatcontainer
