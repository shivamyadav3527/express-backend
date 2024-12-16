import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.modal.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    console.log("hakuma matata");
   // get the user detail from the frontend (here user modal is reference)
   // validation check for not empty
   // check if the user already exists
   // check for images and avatar as it is mandatory field
   // upload them to cloudinary also check if is uploaded successfully
   // create the entry in the db for the user object (it will give response)
   // remove the password and refresh token from the response
   // check for user creation , is it successfully created
   // return response to the frontend

    const {username, email, fullName, password} = req.body; // get the user detail from the frontend (here user modal is reference)
    console.log("email: ", email);

    // validation check for not empty
    if([username, email, fullName, password].some((field) => field?.trim() === '')){
        throw new ApiError(400, "All fields are mandatory , Please fill all the values");
    }

    // check if the user already exists through email or username
    const existingUser = User.findOne({
        $or: [{ username },{ email }]
    })
    if(existingUser) {
        throw new ApiError(409, "User with username or email already exists");
    }

    // check for images and avatar as it is mandatory field
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImagePath = req.files?.coverImageh[0]?.path;

    if(!avatarLocalPath) {
        throw new ApiError(400 , "Avatar is required field");
    }

   // upload them to cloudinary also check if is uploaded successfully
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImagePath);
    if(!avatar) {
            throw new ApiError(400 , "Avatar is required field");
    }

   // create the entry in the db for the user object (it will give response)
    const user = User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        password,
        email
   })

    // remove the password and refresh token from the response
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    // check for user creation , is it successfully created
    if(!createdUser){
        throw new ApiError(500, "Something went wrongand user is not created");
    }

    // return response to the frontend
    return res.status(201).json(
        new ApiResponse(200 ,createdUser, "User Created Successfully")
    )

})

export {registerUser}