import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";



export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    
    const [users ,setUsers] = useState([]);
    const [messages ,setMessages] = useState([]);
    const [selectedUser ,setSelectedUser] = useState(null);
    const [unseenMessages ,setUnseenMessages] = useState({});

    const {socket ,axios} = useContext(AuthContext);

    // function to get all users for sidebar
    const getUsers = async () => {
        try {
            const { data } =await axios.get('/api/messages/users');
            if(data.success){
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    // function to get messages for selected users
    const getMessages = async (userId) => {
        try {
            const {data} = await axios.get(`/api/messages/${userId}`);
            if(data.success){
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    // function to send message to selected user
    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`,messageData);

            if (data.success) {
                setMessages(prev => {
                // Replace only the matching pending message
                    if (messageData.tempId) {
                        return prev.map(msg =>
                            msg._id === messageData.tempId
                            ? {...data.newMessage}
                            : msg
                        );
                    }

                    // Normal text message
                    return [...prev, data.newMessage];
                });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);

            // Rollback pending message on failure
            if (messageData.tempId) {
                setMessages(prev =>
                    prev.filter(msg => msg._id !== messageData.tempId)
                );
            }
        }
    };

    // funtion to subscribe to message for selected user
    const subscribeToMessage = () => {
        if (!socket) return;

        const handler = (newMessage) => {
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;

                setMessages(prev => {
                    if (prev.some(msg => msg._id === newMessage._id)) {
                        return prev;
                    }
                    return [...prev, newMessage];
                });

                if (axios.defaults.headers.common["token"]) {
                    axios.put(`/api/messages/mark/${newMessage._id}`);
                }

            } else {
                setUnseenMessages(prev => ({
                    ...prev,
                    [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1
                }));
            }
        };

        socket.on("newMessage", handler);

        return () => {
            socket.off("newMessage", handler);
        };
    };
 
    useEffect(()=>{
        const cleanup = subscribeToMessage();
        return cleanup;
    } ,[socket ,selectedUser])

    const value={
        messages ,setMessages, users ,selectedUser ,setSelectedUser ,unseenMessages ,setUnseenMessages ,
        getUsers ,getMessages ,sendMessage ,
    }
    
    return (
        <ChatContext.Provider value={value} >
            {children}
        </ChatContext.Provider>
    )
}