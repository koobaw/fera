import { Module } from '@nestjs/common';
import { CardsController } from './cards.controller';
import { GetCardsService } from './get.cards/get.cards.service';
import { RegisterCardService } from './register.cards/register.cards.service';
import { DeleteCardService } from './delete.cards/delete.cards.service';

@Module({
  controllers: [CardsController],
  providers: [GetCardsService, RegisterCardService, DeleteCardService],
})
export class CardsModule {}
