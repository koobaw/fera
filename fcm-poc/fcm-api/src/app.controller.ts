import { Controller, Post, Body, Logger } from '@nestjs/common';
import { MessageDto } from './message.dto';
import * as FCM from 'fcm-node';

@Controller()
export class AppController {
  private readonly serverKey =
    'AAAAu6SBq8E:APA91bGZQPkosHb6Ko5xbpMH4nfbsYSKIJpv0L3VdbfgfjEIa-iFB4xX_bNGLxaeeGE0lh6oaoSWrKk2ZY5-jKxFu8bkDF431_o11v9RqiKyWnFyGwyaJsX83d6yT4TXOYXpDrVdnmBw';
  private readonly fcm = new FCM(this.serverKey);
  private readonly logger = new Logger(AppController.name);

  @Post('send')
  async sendMessage(@Body() messageDto: MessageDto): Promise<string> {
    console.log('Title:', messageDto.title);
    this.logger.log('Title:', messageDto.title);
    console.log('Bodys:', messageDto.body);
    this.logger.log('Bodys:', messageDto.body);

    return new Promise((resolve, reject) => {
      const message = {
        notification: {
          title: messageDto.title,
          body: messageDto.body,
        },
        to: 'epyz0CrXXsW1NXHtiY4p-F:APA91bHislYWB4kfFhkEHiwR-46TSYvbt2P6_wx3g6mgHqVw5Jtu8tuBzgJpu2Ch4zyFGqospxaG9HzUG1xcmM9vM63oy3XUnmHvtz8CQrhi2hU7qhTLKnMNFT5kXaapHtnxRGsmKllh',
      };

      this.fcm.send(message, (err, response) => {
        if (err) {
          console.error('Error sending message:', err);
          reject('Error sending message');
        } else {
          console.log('Successfully sent:', response);
          resolve('Message sent successfully!');
        }
      });
    });
  }
}
