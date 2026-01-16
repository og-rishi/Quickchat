import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    email : {type : String ,required : true ,unique : true},
    fullName : {type : String ,required : true},
    password : {type : String ,default : "" ,minlength : 8},
    bio : {type : String},
    profilePic : {type : String ,default : ""}, 
} , {timestamps : true});

const User = mongoose.model("User" ,userSchema);

export default User;