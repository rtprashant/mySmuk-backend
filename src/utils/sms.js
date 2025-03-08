import axios from 'axios'

export const sendOTP = async (phone, otp) => {
    const apiKey = process.env.SMS_API; // Replace with your API Key
    const message = `Your OTP is ${otp}. Do not share it with anyone.`;
    
    try {
        const response = await axios.post("https://www.fast2sms.com/dev/bulkV2", {
            route: "otp",
            variables_values: otp,
            numbers: phone,
        }, {
            headers: {
                "authorization": apiKey,
                "Content-Type": "application/json"
            }
        });

        console.log("OTP Sent:", response.data);
    } catch (error) {
        console.error("Error sending OTP:", error.response ? error.response.data : error.message);
    }
};


