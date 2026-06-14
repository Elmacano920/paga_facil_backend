import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PayoutsService {
  private readonly logger = new Logger(PayoutsService.name);
  private readonly failRate: number;

  constructor(private configService: ConfigService) {
    this.failRate = parseFloat(this.configService.get<string>('PAYOUT_FAIL_RATE') || '0.10');
  }

  async disburse(
    bankCode: string,
    phone: string,
    documentId: string,
    amount: number,
  ): Promise<{ success: boolean; reference?: string; error?: string }> {
    this.logger.log(`Iniciando Pago Móvil: Banco ${bankCode}, Teléfono ${phone}, Cédula ${documentId}, Monto ${amount} USD`);

    // Simular latencia de red de la API bancaria
    await new Promise((resolve) => setTimeout(resolve, 800));

    const random = Math.random();
    if (random < this.failRate) {
      this.logger.error(`Pago Móvil fallido de forma simulada para teléfono ${phone}`);
      return {
        success: false,
        error: 'PAGO_MOVIL_REJECTED_BY_BANK',
      };
    }

    const reference = Math.floor(10000000 + Math.random() * 90000000).toString();
    this.logger.log(`Pago Móvil exitoso. Referencia: PM-${reference}`);

    return {
      success: true,
      reference: `PM-${reference}`,
    };
  }
}
