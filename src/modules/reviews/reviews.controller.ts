import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { VoteReviewDto } from './dto/vote-review.dto';

@ApiTags('Reseñas')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Publicar una reseña (requiere adelanto DISBURSED con la empresa)' })
  @ApiResponse({ status: 201, description: 'Reseña publicada + 15 LTK acreditados' })
  publishReview(@Body() dto: CreateReviewDto) {
    return this.reviewsService.publishReview(dto);
  }

  @Get('company/:id')
  @ApiOperation({ summary: 'Obtener reseñas de una empresa con estadísticas de rating' })
  @ApiParam({ name: 'id', description: 'UUID de la empresa' })
  getReviewsForCompany(@Param('id') id: string) {
    return this.reviewsService.getReviewsForCompany(id);
  }

  @Get('employee/:id')
  @ApiOperation({ summary: 'Obtener reseñas escritas por un empleado' })
  @ApiParam({ name: 'id', description: 'UUID del empleado' })
  getReviewsByEmployee(@Param('id') id: string) {
    return this.reviewsService.getReviewsByEmployee(id);
  }

  @Post(':id/vote')
  @ApiOperation({ summary: 'Votar una reseña como útil o no útil' })
  @ApiParam({ name: 'id', description: 'UUID de la reseña' })
  @ApiResponse({ status: 200, description: 'Voto registrado (útil +3 LTK al autor)' })
  voteReview(@Param('id') reviewId: string, @Body() dto: VoteReviewDto) {
    return this.reviewsService.voteReview(reviewId, dto);
  }
}