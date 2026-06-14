import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const driverError = exception.driverError as any;
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Ocurrió un error interno en el servidor.';
    let errorType = 'InternalServerError';

    if (driverError && driverError.code === '23505') {
      status = HttpStatus.CONFLICT;
      errorType = 'ConflictException';

      const detail = driverError.detail || '';
      const match = detail.match(/Key \((.+)\)=\((.+)\) already exists/);
      if (match) {
        const [, field, value] = match;
        const fieldClean = field.replace(/"/g, '');
        const fieldLabels: Record<string, string> = {
          documentId: 'documento de identidad (Cédula)',
          rif: 'RIF/NIT',
          phone: 'teléfono',
          pagoMovilRef: 'referencia de Pago Móvil',
        };
        const label = fieldLabels[fieldClean] || fieldClean;
        message = `Ya existe un registro con el ${label} '${value}'.`;
      } else {
        message = 'El registro con datos únicos provistos ya existe en el sistema.';
      }
    }
    else if (driverError && driverError.code === '23503') {
      status = HttpStatus.BAD_REQUEST;
      errorType = 'BadRequestException';
      message = 'El registro hace referencia a una relación inexistente (ej. empresa o empleado inválido).';
    }

    this.logger.error(`Error de base de datos capturado [${driverError?.code || 'unknown'}]: ${exception.message}`);

    response.status(status).json({
      statusCode: status,
      error: errorType,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
