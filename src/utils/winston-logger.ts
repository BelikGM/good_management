import { transports, format } from 'winston';
import { blue, yellow, bold } from 'colorette';
import 'winston-daily-rotate-file';

const { combine, timestamp, json, errors, colorize, align, printf } = format;

const errorFilter = format((info, opts) => {
  return info.level === 'error' ? info : false;
});

const infoFilter = format((info, opts) => {
  return info.level === 'info' ? info : false;
});

const combinedFileRotateTransport = new transports.DailyRotateFile({
  filename: '/app/logs/combined-%DATE%.log',
  datePattern: 'DD-MM-YYYY',
  maxFiles: '10d',
});

const errorFileRotateTransport = new transports.DailyRotateFile({
  filename: '/app/logs/app-error-%DATE%.log',
  level: 'error',
  datePattern: 'DD-MM-YYYY',
  maxFiles: '10d',
  format: combine(errors({ stack: true }), errorFilter(), timestamp(), json()),
});

const infoFileRotateTransport = new transports.DailyRotateFile({
  filename: '/app/logs/app-info-%DATE%.log',
  level: 'info',
  datePattern: 'DD-MM-YYYY',
  maxFiles: '10d',
  format: combine(infoFilter(), timestamp(), json()),
});

export const winstonConfig = {
  exitOnError: false,
  prettyPrint: true,
  level: 'http',
  format: combine(
    errors({ stack: true }),
    timestamp({
      format: 'DD-MM-YYYY hh:mm:ss.SSS A',
    }),
    json(),
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize({ all: true }),
        align(),
        printf(
          (info) =>
            `[${blue(info.timestamp)}]  ${info.level}:  ${bold(
              yellow(
                info.status
                  ? info.status
                  : info.level.includes('info')
                    ? 200
                    : 500,
              ),
            )} - ${info.url ? info.url : ''} - ${
              info.method ? info.method : ''
            } - ${info.response_time ? info.response_time : ''} - ${info.message} ---------------- \n 
            ${info.stack ? info.stack : 'no stack trace'} \n`,
        ),
      ),
    }),
    combinedFileRotateTransport,
    errorFileRotateTransport,
    infoFileRotateTransport,
  ],
  // exceptionHandlers: [
  //   new transports.File({ filename: "logs/exception.log" }),
  // ],
  // rejectionHandlers: [
  //   new transports.File({ filename: "logs/rejections.log" }),
  // ],
};
