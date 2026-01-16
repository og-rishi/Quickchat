import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { io ,userSocketMap } from "../server.js";

// Get all users except the logged in user
export const getUsersForSidebar = async(req ,res)=>{
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({_id : {$ne : userId}}).select("-password");
        // Count unseen message
        const unseenMessage = {}
        const promises = filteredUsers.map(async (user)=>{
            const messages = await Message.find({senderId : user._id ,receiverId : userId ,seen : false});
            if(messages.length > 0){
                unseenMessage[user._id] = messages.length;
            }
        })
        await Promise.all(promises);
        // last message
        const usersWithLastMessage = await Promise.all(
            filteredUsers.map(async (user) => {
                const lastMessage = await Message.findOne({
                    $or: [
                        { senderId: user._id, receiverId: userId },
                        { senderId: userId, receiverId: user._id }
                    ]
                })
                    .sort({ createdAt: -1 })
                    .select("text image createdAt senderId");

                return {
                    ...user.toObject(),
                    lastMessage
                };
            })
        );

        res.json({success : true ,users : usersWithLastMessage ,unseenMessages : unseenMessage})

    } catch (error) {
        console.log(error.message);
        res.json({success : false ,message : error.message})
    }
}
// get all messages for selected user
export const getMessages = async(req ,res)=>{
    try {
        const { id : selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or : [
                {senderId : selectedUserId ,receiverId : myId},
                {senderId : myId ,receiverId : selectedUserId},
            ]
        });
        await Message.updateMany({senderId:selectedUserId ,receiverId:myId} ,{seen : true});
        res.json({success : true ,messages});

    } catch (error) {
        console.log(error.message);
        res.json({success : false ,message : error.message})
    }
}
// api to mark message as seen using message id
export const markMessageAsSeen = async(req ,res)=>{
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id ,{seen : true});
        res.json({success : true});
    } catch (error) {
        console.log(error.message);
        res.json({success : false ,message : error.message})
    }
}
// send message to selected user
export const sendMessage = async (req ,res)=>{
    try {
        const {text ,image} = req.body;
        const senderId = req.user._id;
        const receiverId = req.params.id;
        let image_url;

        if(image){
            const uploadRespone = await cloudinary.uploader.upload(image);
            image_url = uploadRespone.secure_url;
        }
        const newMessage = await Message.create({
            senderId,
            text,
            receiverId,
            image : image_url
        })

        // Emit the new message to receiver
        const receiverSocketId = userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage" ,newMessage)
        }

        res.json({success : true ,newMessage});
    } catch (error) {
        console.log(error.message);
        res.json({success : false ,message : error.message})
    }
}
