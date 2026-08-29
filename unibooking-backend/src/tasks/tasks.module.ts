import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BookingsCronService } from './bookings-cron.service';

@Module({
  // forRoot() boots Nest's scheduler engine -- must be registered exactly
  // once app-wide. Kept here rather than in AppModule so everything about
  // "scheduled work" (its module, its registration, its jobs) lives in one
  // place as more @Cron/@Interval services join this module later.
  imports: [ScheduleModule.forRoot()],
  providers: [BookingsCronService],
})
export class TasksModule {}
