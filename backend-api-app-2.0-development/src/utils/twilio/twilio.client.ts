import { Twilio } from "twilio";

const twilio_sid: any = process.env.TWILIO_SID
const twilio_auth: any = process.env.TWILIO_AUTH

const twilio = new Twilio(twilio_sid, twilio_auth);

export default twilio