import { Module } from '@nestjs/common';
import { ActiveSelectionStore } from './active-selection.store';

@Module({
  providers: [ActiveSelectionStore],
  exports: [ActiveSelectionStore],
})
export class ActiveSelectionModule {}
