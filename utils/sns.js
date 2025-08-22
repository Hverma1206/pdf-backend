import AWS from "aws-sdk";

const sns = new AWS.SNS({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function sendSms(phone, message) {
  try {
    const params = {
      Message: message,
      PhoneNumber: phone.startsWith("+") ? phone : `+91${phone}`, 
    };

    const result = await sns.publish(params).promise();
    console.log("SNS Response:", result);
    return result;
  } catch (err) {
    console.error("SNS Error:", err);
    throw err;
  }
}
