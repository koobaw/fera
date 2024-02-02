/* eslint-disable import/no-extraneous-dependencies */
import { Controller, Post, Body, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { MessageDto } from './dto/message.dto';

@Controller()
export class SendController {
  private readonly logger = new Logger(SendController.name);

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
        token:
          'cCxbpI8SERwvSMhMmyDtS1:APA91bGDBMxz5W0M7cugcPOJSaNJfrnl_zEf5TflwJskUSkSmK0t9148BsR4Gp_PdZPh-90TY0OZcQ21hQXWMunBHSQqYc3FVjXl-J1WrCyvt6qK9-FJWWEQzju_tjO0-7mE0LXZIT3D',
      };

      try {
        // Send notification message
        admin.messaging().send(message);
        console.log('Successfully sent notification message');
        // Save message to Firestore
        this.saveMessageToFirestore(messageDto);
        resolve('Message sent successfully!');
      } catch (err) {
        console.error('Error sending message:', err);
        reject(new Error('Error sending message'));
      }
    });
  }

  private async saveMessageToFirestore(messageDto: MessageDto): Promise<void> {
    const firestore = admin.firestore();
    const messagesCollection = firestore.collection('fcmMessages');

    // Add the message to Firestore
    await messagesCollection.add({
      title: messageDto.title,
      body: messageDto.body,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}
