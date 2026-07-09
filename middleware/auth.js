const jwt = require("jsonwebtoken");
const secretKey = "my_super_secret_key_123";

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log(`>>>>>>>>>>`, authHeader);
        if (!authHeader){
            return res.status(401).json({ message: "No token provided" });
        }
        const token = authHeader.split(" ")[1];
        const decoded =jwt.verify(token, secretKey);
        
        req.user = decoded; 
        
       
    next();
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: "Invalid or expired token" });
  }
};
