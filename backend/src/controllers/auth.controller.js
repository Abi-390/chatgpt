const userModel = require("../models/user.model")


async function registerController(req,res){

    const{fullName:{firstName,lastName},email,password} = req.body;
}