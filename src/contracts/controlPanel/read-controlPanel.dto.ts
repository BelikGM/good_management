import { PanelType } from 'src/domains/controlPanel.entity';
import { Organization } from 'src/domains/organization.entity';
import { PanelToStatistic } from 'src/domains/panelToStatistic.entity';
import { Post } from 'src/domains/post.entity';

/**
 * DTO для чтения данных панели управления.
 */
export class ControlPanelReadDto {
  id: string;

  panelName: string;

  orderNumber: number;

  controlPanelNumber: number;

  panelType: PanelType;

  isNameChanged: boolean;

  createdAt: Date;

  updatedAt: Date;

  panelToStatistics: PanelToStatistic[];

  organization: Organization;

  post: Post;
}
