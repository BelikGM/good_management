import { ConvertCreateDto } from 'src/contracts/convert/create-convert.dto';
import { ConvertUpdateDto } from 'src/contracts/convert/update-convert.dto';
import { PathConvert } from 'src/domains/convert.entity';

export function setConvertPath(
  convertDto: ConvertCreateDto | ConvertUpdateDto,
  postIdsFromSenderToReciver: string[],
  isCommonDivision: boolean,
): void {
  if (!isCommonDivision) {
    convertDto.convertPath = PathConvert.REQUEST;
  } else if (postIdsFromSenderToReciver.length > 2) {
    convertDto.convertPath = PathConvert.COORDINATION;
  } else {
    convertDto.convertPath = PathConvert.DIRECT;
  }
}
