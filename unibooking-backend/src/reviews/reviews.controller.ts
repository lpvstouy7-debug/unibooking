import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsQueryDto } from './dto/reviews-query.dto';
import { ReviewDto, ReviewsResult, ReviewsService } from './reviews.service';

// No single @Controller(prefix) here -- this module owns two unrelated
// paths (POST /reviews, GET /services/:serviceId/reviews) rather than one
// resource root, so each route declares its own full path instead.
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('reviews')
  create(
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ReviewDto> {
    return this.reviewsService.create(dto, user);
  }

  // Public -- powers the review list + average rating on a service's detail page.
  @Get('services/:serviceId/reviews')
  findForService(
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
    @Query() query: ReviewsQueryDto,
  ): Promise<ReviewsResult> {
    return this.reviewsService.findForService(serviceId, query);
  }
}
