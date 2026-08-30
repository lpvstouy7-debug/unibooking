import { Module } from '@nestjs/common';
import { AvailabilitySearchService } from './availability-search.service';
import { SupplierOwnershipService } from './supplier-ownership.service';

/**
 * Shared engine for every vertical module (Hotels, Transport, Tours,
 * CarRentals) -- read side (AvailabilitySearchService) and write side
 * (SupplierOwnershipService) -- and, if it's ever refactored onto these
 * too, the original generic ServicesModule. Import this wherever either is
 * injected; nothing here is controller-facing on its own.
 */
@Module({
  providers: [AvailabilitySearchService, SupplierOwnershipService],
  exports: [AvailabilitySearchService, SupplierOwnershipService],
})
export class CatalogCommonModule {}
