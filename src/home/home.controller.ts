import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { HomeService } from './home.service';
import { CreateHomeDto, HomeResponseDto, UpdateHomeDto } from './dto/home.dto';
import { PropertyType } from '@prisma/client';
import { User, UserInfo } from 'src/user/decorators/user.decorator';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}
  @Get()
  getHomes(
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('propertyType') propertyType?: PropertyType,
  ): Promise<HomeResponseDto[]> {
    console.log({
      city,
      minPrice,
      maxPrice,
      propertyType,
    });
    const price =
      minPrice || maxPrice
        ? {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          }
        : undefined;

    const filters = {
      ...(city && { city }), // {city} is eq. to {city: city} i.e prop city = val of city
      ...(price && { price }),
      ...(propertyType && { propertyType: propertyType }),
    };
    return this.homeService.getHomes(filters);
  }

  @Get(':id')
  getHome(@Param('id', ParseIntPipe) id: number): Promise<HomeResponseDto> {
    return this.homeService.getHomeById(id);
  }

  @Post()
  createHome(@Body() body: CreateHomeDto, @User() user: UserInfo) {
    console.log(user);
    return this.homeService.createHome(body, user.id);
  }

  @Put(':id')
  updateHome(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateHomeDto,
  ): Promise<HomeResponseDto> {
    return this.homeService.updateHomeById(id, body);
  }

  @Delete(':id')
  deleteHome(@Param('id', ParseIntPipe) id: number) {
    return this.homeService.deleteHome(id);
  }
}
