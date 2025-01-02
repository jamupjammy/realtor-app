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
  UnauthorizedException,
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
  async updateHome(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateHomeDto,
    @User() user: UserInfo,
  ): Promise<HomeResponseDto> {
    console.log('this is from controller', id, body);
    const realtor = await this.homeService.getRealtorByHomeId(id);
    if (realtor.id !== user.id) {
      throw new UnauthorizedException();
    } // left part fetched from db vs right part is from the decorator (interceptor adds this from request)
    return this.homeService.updateHomeById(id, body);
  }

  @Delete(':id')
  async deleteHome(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserInfo,
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(id);
    if (realtor.id !== user.id) {
      throw new UnauthorizedException();
    } // left part fetched from db vs right part is from the decorator (interceptor adds this from request)
    return this.homeService.deleteHome(id);
  }
}
