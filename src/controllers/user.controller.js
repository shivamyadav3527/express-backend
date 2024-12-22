import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.modal.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
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

    // validation check for not empty
    if([username, email, fullName, password].some((field) => field?.trim() === '')){
        throw new ApiError(400, "All fields are mandatory , Please fill all the values");
    }

    // check if the user already exists through email or username
    const existingUser = await User.findOne({
        $or: [{ username },{ email }]
    })
    if(existingUser) {
        throw new ApiError(409, "User with username or email already exists");
    }
    console.log(req.files)
    // check for images and avatar as it is mandatory field
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImagePath = req.files?.coverImage[0]?.path;
    let coverImagePath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0) {
        coverImagePath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath) {
        throw new ApiError(400 , "Avatar path is required field");
    }

   // upload them to cloudinary also check if is uploaded successfully
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImagePath);
    if(!avatar) {
            throw new ApiError(400 , "Avatar is required field");
    }

   // create the entry in the db for the user object (it will give response)
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        password,
        email
   })

    // remove the password and refresh token from the response
    const createdUser = await User.findById(user._id);

    // check for user creation , is it successfully created
    if(!createdUser){
        throw new ApiError(500, "Something went wrong and user is not created");
    }

    // return response to the frontend
    return res.status(201).json(
        new ApiResponse(200 ,createdUser, "User Created Successfully")
    )

})

//Function for generating the access and refresh token altogether
const generateAccessAndRefreshToken = async(userId) => {
    const user = await User.findById(userId)
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})

    return {accessToken, refreshToken}
}

const loginUser = asyncHandler(async (req, res) => {
    // Get data from the req.body
    // Check for username and email as we will use this for login
    // Check user exists with these username and email or not (any one of them will work for login)
    // check if the password is valid or not
    // generate access and refresh token
    // send above these token as cookies


    // Get data from the req.body
    const {username, email, password} = req.body
    console.log(email);

    // Check for username and email as we will use this for login
    if(!(username || email)) {
        throw new ApiError(400, "username and email is required field")
    }

    // Check user exists with these username and email or not (any one of them will work for login)
    const user = await User.findOne({
        $or: [{username},{email}]
    })
    if(!user) {
        throw new ApiError(404, "user does not exists");
    }

    // check if the password is valid or not
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid Password")
    }

    // generate access and refresh token
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const userLoggedIn = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: accessToken, userLoggedIn, refreshToken
            },
            "User Logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpsOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(
        new ApiResponse(200, {}, "User Logged Out")
    )
})

const refreshAccessToken = asyncHandler(async(req, res) =>{
    const incomingRefreshAccessToken = req.cookie?.refreshToken || req.body.refreshToken
    if(!incomingRefreshAccessToken) {
        throw new ApiError(401, "unauthorized request")
    }
    try{
        const decodedRefreshToken = jwt.verify(incomingRefreshAccessToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedRefreshToken._id)
        if(!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if(incomingRefreshAccessToken !== user?.refreshToken) {
            throw new ApiError(401, "invalid refresh token")
        }

        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
        const options = {
            httpOnly: true,
            secure: true
        }

        return res.
        status(200)
        .cookie("accessToken", accessToken. options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(200,
                {accessToken, refreshToken: newRefreshToken},
                "Access Token Refreshed")
        )
    } catch(error){
        throw new ApiError(401, error?.message || "unauthorized request")
    }

})
export {registerUser, loginUser, logoutUser, refreshAccessToken}