import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  createProduct(createProductDto: CreateProductDto, user: User) {
    console.log('createProductDto:', createProductDto);
    console.log('user:', user);
    return {
      message: 'Product created successfully',
      user: user,
    };
  }

  getProducts() {
    return `This action returns all products`;
  }

  getProduct(id: string) {
    return `This action returns a #${id} product`;
  }

  updateProduct(id: string, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  deleteProduct(id: string) {
    return `This action removes a #${id} product`;
  }
}
