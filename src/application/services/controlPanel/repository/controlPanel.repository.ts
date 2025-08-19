import { Injectable } from '@nestjs/common';
import { ControlPanel } from 'src/domains/controlPanel.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ControlPanelRepository extends Repository<ControlPanel> {
  constructor(private dataSource: DataSource) {
    super(ControlPanel, dataSource.createEntityManager());
  }
}
