import mongoose from "mongoose";

const checkConnectionDB = async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/SarahaApp", {
    serverSelectionTimeoutMS: 5000,
  }).then(()=>{
    console.log("db connected");
    
  })
  .catch((error)=>{
    console.log(error);
    
  });
};

export default checkConnectionDB
