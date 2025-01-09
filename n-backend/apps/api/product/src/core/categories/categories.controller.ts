import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';

import { AuthGuard } from '@fera-next-gen/guard';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('/')
  @UseGuards(AuthGuard)
  async findCategories() {
    const categories = await this.categoriesService.getCategories();

    return { code: HttpStatus.OK, message: 'ok', data: categories };
  }
}
