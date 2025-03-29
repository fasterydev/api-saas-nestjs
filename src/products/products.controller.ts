import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('createProduct')
  @Auth(ValidRoles.user)
  createProduct(@Body() createProductDto: CreateProductDto,@GetUser() user: User) {
    return this.productsService.createProduct(createProductDto,user);
  }

  @Get('getProducts')
  @Auth(ValidRoles.user)
  getProducts() {
    return this.productsService.getProducts();
  }

  @Get('getProduct/:id')
  @Auth(ValidRoles.user)
  getProduct(@Param('id') id: string) {
    return this.productsService.getProduct(id);
  }

  @Patch('updateProduct/:id')
  @Auth(ValidRoles.user)
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @Delete('deleteProduct/:id')
  @Auth(ValidRoles.user)
  deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }
}
