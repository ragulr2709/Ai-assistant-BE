import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class ModelValidatorService implements OnModuleInit {
  private readonly logger = new Logger(ModelValidatorService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    if (!apiKey) {
      this.logger.warn('No Gemini API key configured; skipping model validation.');
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
      const list = await genAI.listModels();
      const models = Array.isArray(list?.models) ? list.models : Array.isArray(list) ? list : [];
      this.logger.log(`Found ${models.length} models from Gemini API`);
      // Log up to 10 model ids/names for visibility
      const names = models.slice(0, 10).map((m: any) => m.name || m.id || String(m));
      this.logger.log(`Sample models: ${names.join(', ')}`);

  const configured = this.configService.get<string>('gemini.generationModel');
      if (!configured || configured === 'latest') {
        this.logger.log('No specific generation model configured or set to latest; service may auto-select a model at runtime.');
        return;
      }

      const normalized = configured.startsWith('models/') ? configured : `models/${configured}`;
      const found = models.find((m: any) => (m.name || m.id || '').includes(normalized) || (m.name || m.id || '').includes(configured));
      if (!found) {
        this.logger.warn(
          `Configured generation model ${configured} not found in available models. ` +
            `If generation fails with 404, set GEMINI_GENERATION_MODEL to a supported model (for example 'gemini-3' or 'gemini-2.5') or use 'latest' to auto-select.`,
        );
      } else {
        this.logger.log(`Configured generation model appears available: ${configured}`);
      }
    } catch (e: any) {
      this.logger.warn('Could not list Gemini models: ' + (e?.message || String(e)));
    }
  }
}
