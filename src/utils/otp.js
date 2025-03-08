import { totp } from "otplib"
const secret = process.env.OTP_SECRET
totp.options = { step: 300 };
const generateOtp = async (emailorNumber)=>{
    const otp =  await totp.generate(secret+emailorNumber)
    if(!otp){
        console.log("Error generating OTP")
        return "failed to genrate otp"
    }
    return otp
}

export default generateOtp