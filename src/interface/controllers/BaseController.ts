import { Request, Response } from 'express';

export abstract class BaseController {
  protected abstract executeRoute(req: Request, res: Response): Promise<void>;

  public async exec(req: Request, res: Response): Promise<void> {
    try {
      await this.executeRoute(req, res);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          error: 'Bad request',
          message: error.message,
        });
      } else {
        res.status(500).json({
          error: 'Internal server error',
          message: 'An unexpected error occurred',
        });
      }
    }
  }
}
