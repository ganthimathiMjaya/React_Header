import { Request, Response } from 'express';
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';

export default class ReceiveSmsController {
  public async processText(req: Request, res: Response) {
    let response = new MessagingResponse();
    let message = `Hello ${req.body.From}, your message was: ${req.body.Body}`;

    response.message(message);

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(response.toString());
  }
}
