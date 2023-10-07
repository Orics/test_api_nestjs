import * as moment from 'moment';
import { diskStorage } from 'multer';
import { basename, extname } from 'path';
import { GENERAL_CONFIG } from '../configs/general.config';

export const LocalStorage = diskStorage({
  destination: GENERAL_CONFIG.PUBLIC_LOCATION.FOLDER_PATH,
  filename: (req, file: Express.Multer.File, callback) => {
    const name = basename(file.originalname);
    const fileExtName = extname(file.originalname);
    const time = moment().format('YYMMDDHHmmssSSS');
    callback(null, `${name}-${time}${fileExtName}`);
  },
});
