import FriendRequest from "../models/friendRequest.js";
import User from "../models/User.js";

export async function getRecommendedUsers(req, res) {
    try {
        const currentUserId= req.user.id;
        const currentUser= req.user;
        const recommendedUsers= await User.find({
            $and:[
                {_id: {$ne: currentUserId}},
                {$id: {$nin: currentUser.friends}},
                {isOnboarded:true},
            ],
        });
        res.status(200).json(recommendedUsers);
    } catch (error) {
        console.error("Error in getRecommendedUsers controller", error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}

export async function getMyFriends(req, res) {
    try {
        const user= await User.findById(req.user.id)
        .select("friends")
        .populate("friends", "fullName profilePic nativeLanguage learninglanguage");
        res.status(200).json(user.friends);
    } catch (error) {
        console.error("Error in getMyFriends controller", error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}

export async function sendFriendRequest(req, res) {
    try {
        const myId= req.user.id;
        const{ id: recipientId}= req.params;
        //not sending request to ourselves
        if(myId== recipientId){
            return res.status(400).json({message:"You can't send friend request to yourself"});
        }
        //check if recipient exists 
        const recipient= await User.findById(recipientId);
        if(!recipient){
            return res.status(404).json({message: "Recipient not found"});
        }
        //check if recipient is already a friend
        if(recipient.friends.includes(myId)){
            return res.status(400).json({message:"You are already friends with this user"});
        }

        //check if there is an existing request
        const existingRequest= await FriendRequest.findOne({
            $or:[
                {sender:myId, recipient: recipientId},
                {sender: recipientId, recipient: myId},
            ],
        });

        if(existingRequest){
            return res.status(400).json({message:"A friend request already exists between you and this user"});
        }

        const friendRequest= await FriendRequest.create({
            sender:myId,
            recipient:recipientId,
        });
        res.status(201).json(friendRequest);
        } catch (error) {
        console.error("Error in sendFriendRequest controller", error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}

export async function acceptFriendRequest(req, res) {
    try {
        const{ id: requestId }= req.params;

        if(!friendRequest){
            return res.status(404).json({message:"Request not found"});
        }

        //verify is the user is the recipient
        if(friendRequest.recipient.toString() !== req.user.id){
            return res.status(403).json({message:"You are not authorized to access this request"});
        }

        friendRequest.status="accepted";
        await friendRequest.save();

        //add each user to each other's friends array
        await User.findByIdAndUpdate(friendRequest.sender,{
            $addToSet:{friends: friendRequest.recipient},
        });
        await User.findByIdAndUpdate(friendRequest.recipient,{
            $addToSet:{friends: friendRequest.sender},
        });
        res.status(200).json({message:"Friend request accepted"});
    } catch (error) {
        console.error("Error in acceptFriendRequest controller:", error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}
export async function getFriendRequests(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.log("Error in getPendingFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}